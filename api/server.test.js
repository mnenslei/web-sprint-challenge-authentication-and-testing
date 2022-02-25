const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const Users = require('./auth/auth-model')

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

describe('POST /api/auth/register', () => {
  test('returns an error if register is invalid ',  async () => {
    const res = await request(server).post('/api/auth/register')
    expect(res.body.message).toMatch(/username and password required/i)
    await request(server).post('/api/auth/register').send({username: 'coco', password:'12345'})
    const newUser = await request(server).post('/api/auth/register').send({username: 'coco', password:'12345'})
    expect(newUser.body.message).toMatch(/username taken/i)
  })
  test('returns an username if successfully registered', async () => {
    const res = await request(server).post('/api/auth/register').send({username: 'quinn', password:'12345'})
    expect(res.body.username).toBe('quinn')
    expect(res.body).toBeInstanceOf(Object)
  })
})

describe('POST /api/auth/login', () => {
  test('returns an error if username/password is missing or invalid', async () => {
    const res = await request(server).post('/api/auth/login')
    expect(res.body.message).toMatch(/username and password required/i)
    await request(server).post('/api/auth/register').send({username: 'coco', password: '12345'})
    let user = await request(server).post('/api/auth/login').send({username: 'coco', password: '1234'})
    expect(user.body.message).toMatch(/invalid credentials/i)
  })
  test('returns welcome message if successfully logged in', async () => {
    await request(server).post('/api/auth/register').send({username: 'coco', password: '12345'})
    const res = await request(server).post('/api/auth/login').send({username: 'coco', password: '12345'})
    expect(res.body.message).toMatch(`Welcome, coco`)
  })
})