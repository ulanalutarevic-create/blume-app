import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, 'data')
const UPLOADS = path.join(__dirname, 'uploads')
const GDRIVE = path.join(__dirname, 'gdrive')
const MAILBOX = path.join(__dirname, 'mailbox')
const SECRET = 'blume-secret-key'
const PORT = 3010

for (const dir of [DATA, UPLOADS, GDRIVE, MAILBOX]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const files = {
  users: path.join(DATA, 'users.json'),
  plants: path.join(DATA, 'plants.json'),
  logs: path.join(DATA, 'logs.json'),
  filesMeta: path.join(DATA, 'files.json')
}

function read(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
    return structuredClone(fallback)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// seed default admin (no voyager dummy catalog)
if (!fs.existsSync(files.users)) {
  write(files.users, [
    {
      id: uuid(),
      name: 'Админ',
      email: 'admin@mtp.by',
      password: bcrypt.hashSync('admin', 8),
      role: 'admin'
    }
  ])
}
if (!fs.existsSync(files.plants)) {
  write(files.plants, [
    { id: uuid(), name: 'Жёлтые цветы', weight: '2500г', price: 129, city: 'Минск', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Розовые тюльпаны', weight: '3800г', price: 159, city: 'Гродно', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Кактус', weight: '1100г', price: 99, city: 'Брест', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Калла', weight: '1800г', price: 149, city: 'Минск', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Росток', weight: '2200г', price: 139, city: 'Минск', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Дерево', weight: '1500г', price: 119, city: 'Витебск', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Алоэ', weight: '900г', price: 75, city: 'Гомель', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Куст в горшке', weight: '1300г', price: 109, city: 'Могилёв', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Фикус', weight: '1600г', price: 89, city: 'Минск', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Цветы в кувшине', weight: '1700г', price: 125, city: 'Гродно', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Сакура', weight: '600г', price: 55, city: 'Брест', createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Подсолнух', weight: '800г', price: 45, city: 'Минск', createdAt: new Date().toISOString() }
  ])
}
if (!fs.existsSync(files.logs)) write(files.logs, [])
if (!fs.existsSync(files.filesMeta)) write(files.filesMeta, [])

function addLog(user, action, entity, before = null, after = null) {
  const logs = read(files.logs, [])
  logs.unshift({
    id: uuid(),
    user: user?.email || 'system',
    action,
    entity,
    before,
    after,
    createdAt: new Date().toISOString()
  })
  write(files.logs, logs)
}

/** Дубль: совпал id ИЛИ пара name+city → обновить, иначе добавить */
function upsertPlants(incoming) {
  const plants = read(files.plants, [])
  let added = 0
  let updated = 0

  for (const raw of incoming) {
    const row = {
      id: raw.id || null,
      name: String(raw.name || raw.Name || raw['Название'] || 'Без названия'),
      weight: String(raw.weight || raw.Weight || raw['Вес'] || '0г'),
      price: Number(raw.price ?? raw.Price ?? raw['Цена'] ?? 0),
      city: String(raw.city || raw.City || raw['Город'] || 'Минск'),
      createdAt: raw.createdAt || new Date().toISOString()
    }

    const idx = plants.findIndex(
      (p) =>
        (row.id && p.id === row.id) ||
        (p.name.toLowerCase() === row.name.toLowerCase() &&
          p.city.toLowerCase() === row.city.toLowerCase())
    )

    if (idx >= 0) {
      plants[idx] = {
        ...plants[idx],
        name: row.name,
        weight: row.weight,
        price: row.price,
        city: row.city
      }
      updated++
    } else {
      plants.unshift({
        id: row.id || uuid(),
        name: row.name,
        weight: row.weight,
        price: row.price,
        city: row.city,
        createdAt: row.createdAt
      })
      added++
    }
  }

  write(files.plants, plants)
  return { added, updated, total: plants.length }
}

function buildDump() {
  const plants = read(files.plants, [])
  return {
    version: 1,
    type: 'blume_plants_dump',
    exportedAt: new Date().toISOString(),
    count: plants.length,
    plants
  }
}

function latestGdriveDump() {
  const list = fs
    .readdirSync(GDRIVE)
    .filter((f) => f.endsWith('.json'))
    .map((name) => {
      const full = path.join(GDRIVE, name)
      return { name, full, mtime: fs.statSync(full).mtimeMs }
    })
    .sort((a, b) => b.mtime - a.mtime)
  return list[0] || null
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(UPLOADS))

const upload = multer({ dest: UPLOADS })

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Требуется авторизация' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Сессия истекла' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Только для администратора' })
  next()
}

// ---------- Auth ----------
app.post('/api/v1/auth/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Заполните все поля' })
  const users = read(files.users, [])
  if (users.find((u) => u.email === email)) return res.status(400).json({ message: 'Email уже занят' })
  const user = {
    id: uuid(),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role: 'user'
  }
  users.push(user)
  write(files.users, users)
  addLog(user, 'register', 'user', null, { id: user.id, email, role: user.role })
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name, email, role: user.role } })
})

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body
  const users = read(files.users, [])
  const user = users.find((u) => u.email === email)
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ message: 'Неверный email или пароль' })
  }
  addLog(user, 'login', 'user', null, { email })
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

app.post('/api/v1/auth/forgot', (req, res) => {
  const { email } = req.body
  const users = read(files.users, [])
  const user = users.find((u) => u.email === email)
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' })
  addLog(user, 'forgot_password', 'user', null, { email })
  res.json({ message: `Ссылка для восстановления отправлена на ${email} (учебный режим)` })
})

// ---------- Plants CRUD (async API) ----------
app.get('/api/v1/plants', auth, (req, res) => {
  let plants = read(files.plants, [])
  const { from, to, page = 1, limit = 10 } = req.query
  if (from) plants = plants.filter((p) => p.createdAt >= from)
  if (to) plants = plants.filter((p) => p.createdAt <= to)
  const p = Number(page)
  const l = Number(limit)
  const start = (p - 1) * l
  const items = plants.slice(start, start + l)
  res.json({ items, total: plants.length, page: p, limit: l })
})

app.post('/api/v1/plants', auth, (req, res) => {
  const plants = read(files.plants, [])
  const item = {
    id: uuid(),
    name: req.body.name || 'Без названия',
    weight: req.body.weight || '0г',
    price: Number(req.body.price) || 0,
    city: req.body.city || 'Минск',
    createdAt: new Date().toISOString()
  }
  plants.unshift(item)
  write(files.plants, plants)
  addLog(req.user, 'create', 'plant', null, item)
  res.status(201).json(item)
})

app.put('/api/v1/plants/:id', auth, (req, res) => {
  const plants = read(files.plants, [])
  const idx = plants.findIndex((p) => p.id === req.params.id)
  if (idx < 0) return res.status(404).json({ message: 'Не найдено' })
  const before = { ...plants[idx] }
  plants[idx] = {
    ...plants[idx],
    name: req.body.name ?? plants[idx].name,
    weight: req.body.weight ?? plants[idx].weight,
    price: req.body.price != null ? Number(req.body.price) : plants[idx].price,
    city: req.body.city ?? plants[idx].city
  }
  write(files.plants, plants)
  addLog(req.user, 'update', 'plant', before, plants[idx])
  res.json(plants[idx])
})

app.delete('/api/v1/plants/:id', auth, (req, res) => {
  let plants = read(files.plants, [])
  const before = plants.find((p) => p.id === req.params.id)
  if (!before) return res.status(404).json({ message: 'Не найдено' })
  plants = plants.filter((p) => p.id !== req.params.id)
  write(files.plants, plants)
  addLog(req.user, 'delete', 'plant', before, null)
  res.json({ ok: true })
})

// ---------- Excel upload ----------
app.post('/api/v1/upload/excel', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не передан' })
    const original = req.file.originalname || ''
    const ext = path.extname(original).toLowerCase()
    if (!['.xls', '.xlsx'].includes(ext) || original.startsWith('~$')) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({
        message: 'Допустимы только файлы Excel',
        formats: ['.xls', '.xlsx']
      })
    }

    const finalName = `${Date.now()}_${original.replace(/[^\w.\-а-яА-ЯёЁ ]+/gi, '_')}`
    const finalPath = path.join(UPLOADS, finalName)
    fs.renameSync(req.file.path, finalPath)

    const workbook = XLSX.readFile(finalPath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    const result = upsertPlants(rows)

    const meta = read(files.filesMeta, [])
    const fileRec = {
      id: uuid(),
      name: original,
      storedAs: finalName,
      size: fs.statSync(finalPath).size,
      storage: 'local',
      uploadedBy: req.user.email,
      createdAt: new Date().toISOString(),
      rows: rows.length,
      added: result.added,
      updated: result.updated
    }
    meta.unshift(fileRec)
    write(files.filesMeta, meta)

    addLog(req.user, 'upload_excel', 'file', null, {
      file: original,
      rows: rows.length,
      added: result.added,
      updated: result.updated
    })
    res.json({
      file: fileRec,
      imported: rows.length,
      added: result.added,
      updated: result.updated
    })
  } catch (err) {
    console.error('upload excel error', err)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path) } catch { /* ignore */ }
    }
    res.status(500).json({ message: 'Не удалось обработать Excel-файл' })
  }
})

// ---------- Files list ----------
app.get('/api/v1/files', auth, (req, res) => {
  const meta = read(files.filesMeta, [])
  res.json({
    local: meta.filter((f) => f.storage === 'local'),
    remote: meta.filter((f) => f.storage === 'gdrive'),
    all: meta
  })
})

app.delete('/api/v1/files/:id', auth, (req, res) => {
  let meta = read(files.filesMeta, [])
  const file = meta.find((f) => f.id === req.params.id)
  if (!file) return res.status(404).json({ message: 'Файл не найден' })
  if (file.storage === 'local') {
    const p = path.join(UPLOADS, file.storedAs)
    if (fs.existsSync(p)) fs.unlinkSync(p)
  }
  meta = meta.filter((f) => f.id !== req.params.id)
  write(files.filesMeta, meta)
  addLog(req.user, 'delete_file', 'file', file, null)
  res.json({ ok: true })
})

// simulate google drive dump (legacy: mark uploaded file as remote)
app.post('/api/v1/files/:id/to-gdrive', auth, (req, res) => {
  const meta = read(files.filesMeta, [])
  const file = meta.find((f) => f.id === req.params.id)
  if (!file) return res.status(404).json({ message: 'Файл не найден' })
  file.storage = 'gdrive'
  file.gdriveId = 'gdrive_' + file.id.slice(0, 8)
  write(files.filesMeta, meta)
  addLog(req.user, 'upload_gdrive', 'file', null, file)
  res.json(file)
})

// ---------- Backup: dump → email / Google Drive → restore (upsert) ----------
app.get('/api/v1/backup/status', auth, adminOnly, (req, res) => {
  const latest = latestGdriveDump()
  let dump = null
  if (latest) {
    try {
      const data = JSON.parse(fs.readFileSync(latest.full, 'utf8'))
      dump = {
        name: latest.name,
        exportedAt: data.exportedAt || new Date(latest.mtime).toISOString(),
        count: data.count ?? data.plants?.length ?? 0
      }
    } catch {
      dump = { name: latest.name, exportedAt: new Date(latest.mtime).toISOString(), count: 0 }
    }
  }
  const plants = read(files.plants, [])
  res.json({ plantsTotal: plants.length, latestDump: dump })
})

app.post('/api/v1/backup/to-gdrive', auth, adminOnly, (req, res) => {
  const dump = buildDump()
  const stamp = dump.exportedAt.replace(/[:.]/g, '-')
  const name = `blume_dump_${stamp}.json`
  const full = path.join(GDRIVE, name)
  fs.writeFileSync(full, JSON.stringify(dump, null, 2))

  const meta = read(files.filesMeta, [])
  const fileRec = {
    id: uuid(),
    name,
    storedAs: name,
    size: fs.statSync(full).size,
    storage: 'gdrive',
    gdriveId: 'gdrive_' + uuid().slice(0, 8),
    uploadedBy: req.user.email,
    createdAt: dump.exportedAt,
    rows: dump.count,
    kind: 'dump'
  }
  meta.unshift(fileRec)
  write(files.filesMeta, meta)
  addLog(req.user, 'backup_gdrive', 'dump', null, { name, count: dump.count })

  res.json({
    ok: true,
    message: `Дамп загружен на Google Диск · ${dump.count} записей`,
    file: fileRec,
    count: dump.count
  })
})

app.post('/api/v1/backup/from-gdrive', auth, adminOnly, (req, res) => {
  const latest = latestGdriveDump()
  if (!latest) {
    return res.status(404).json({ message: 'На Google Диске нет дампа. Сначала нажмите «на Google Диск».' })
  }

  let dump
  try {
    dump = JSON.parse(fs.readFileSync(latest.full, 'utf8'))
  } catch {
    return res.status(400).json({ message: 'Не удалось прочитать дамп с Диска' })
  }

  const plants = Array.isArray(dump.plants) ? dump.plants : Array.isArray(dump) ? dump : null
  if (!plants) {
    return res.status(400).json({ message: 'В дампе нет массива plants' })
  }

  const result = upsertPlants(plants)
  addLog(req.user, 'restore_gdrive', 'dump', null, {
    file: latest.name,
    added: result.added,
    updated: result.updated
  })

  res.json({
    ok: true,
    message: `Восстановлено из «${latest.name}» · добавлено ${result.added}, обновлено ${result.updated}`,
    file: latest.name,
    added: result.added,
    updated: result.updated,
    total: result.total
  })
})

app.post('/api/v1/backup/to-email', auth, adminOnly, (req, res) => {
  const to = (req.body?.email || req.user.email || 'admin@mtp.by').trim()
  const dump = buildDump()
  const stamp = dump.exportedAt.replace(/[:.]/g, '-')
  const name = `blume_dump_${stamp}.json`
  const attachment = path.join(MAILBOX, name)
  fs.writeFileSync(attachment, JSON.stringify(dump, null, 2))

  const letter = {
    id: uuid(),
    to,
    from: 'noreply@blume.local',
    subject: `blume* дамп базы · ${dump.count} растений`,
    body: `Учебная отправка: вложение сохранено в server/mailbox/${name}`,
    attachment: name,
    sentAt: dump.exportedAt,
    count: dump.count
  }
  const lettersPath = path.join(MAILBOX, 'outbox.json')
  const letters = read(lettersPath, [])
  letters.unshift(letter)
  write(lettersPath, letters)

  addLog(req.user, 'backup_email', 'dump', null, { to, name, count: dump.count })

  res.json({
    ok: true,
    message: `Письмо с дампом отправлено на ${to} · ${dump.count} записей (учебный режим)`,
    letter,
    count: dump.count
  })
})

// ---------- Logs ----------
app.get('/api/v1/logs', auth, (req, res) => {
  const logs = read(files.logs, [])
  res.json(logs)
})

// ---------- Admin roles ----------
app.get('/api/v1/admin/users', auth, adminOnly, (req, res) => {
  const users = read(files.users, []).map(({ password, ...u }) => u)
  res.json(users)
})

app.put('/api/v1/admin/users/:id/role', auth, adminOnly, (req, res) => {
  const users = read(files.users, [])
  const idx = users.findIndex((u) => u.id === req.params.id)
  if (idx < 0) return res.status(404).json({ message: 'Не найден' })
  const before = { email: users[idx].email, role: users[idx].role }
  users[idx].role = req.body.role === 'admin' ? 'admin' : 'user'
  write(files.users, users)
  addLog(req.user, 'set_role', 'user', before, { email: users[idx].email, role: users[idx].role })
  const { password, ...safe } = users[idx]
  res.json(safe)
})

app.listen(PORT, () => {
  console.log(`blume* API http://127.0.0.1:${PORT}`)
})
