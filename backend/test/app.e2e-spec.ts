import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/official-languages (GET) - should return seeded official languages', () => {
    return request(app.getHttpServer())
      .get('/official-languages')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.some((lang) => lang.name === 'Français')).toBe(true);
        expect(res.body.some((lang) => lang.name === 'Anglais')).toBe(true);
      });
  });

  it('/auth/login (POST) - should login seeded user', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@mulema.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });

  it('/auth/login (POST) - should login admin user', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@mulema.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });
});
