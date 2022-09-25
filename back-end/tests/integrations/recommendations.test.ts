import { prisma } from '../../src/database'
import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import app from '../../src/app'

const agent = supertest(app)

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`
})

describe('POST /recommendations', () => {
    it('should answer with status 201 when all data is correct', async () => {
        const recommendationData = {
            name: faker.random.words(),
            youtubeLink: "https://www.youtube.com/watch?v=" + faker.random.alphaNumeric(8)
        }

        const response = await agent.post('/recommendations').send(recommendationData)

        expect(response.status).toBe(201)
    })

    it('should answer with status 422 when data is malformed', async () => {
        const recommendationData = {
            name: faker.random.words(),
            YouTubeLink: "invalid url"
        }

        const response = await agent.post('/recommendations').send(recommendationData)

        expect(response.status).toBe(422)
    })

    it('should answer with status 409 when all data is correct but duplicated', async () => {
        const recommendationData = {
            name: faker.random.words(),
            youtubeLink: "https://www.youtube.com/watch?v=" + faker.random.alphaNumeric(8)
        }

        await agent.post('/recommendations').send(recommendationData)
        const response = await agent.post('/recommendations').send(recommendationData)

        expect(response.status).toBe(409)
    })

})

describe('GET /recommendations', () => {
    it('should answer with requested body', async () => {
        const response = await agent.get('/recommendations')

        expect(response.body).not.toBeNull()
    })
})

describe('GET /recommendations/random', () => {
    it('should answer with requested body', async () => {
        prisma.recommendation.create({
            data: {
                name: faker.random.words(),
                youtubeLink: "https://www.youtube.com/watch?v=" + faker.random.alphaNumeric(8)
            }
        })
        const response = await agent.get('/recommendations/random')

        expect(response.body).not.toBeNull()
    })

    it('should answer with status 404 when there is no registered music', async () => {
        const response = await agent.get('/recommendations/random')

        expect(response.status).toBe(404)
    })
})

describe('GET /recommendations/top/:amount', () => {
    it('should answer with requested body', async () => {
        const response = await agent.get('/recommendations/top/5')

        expect(response.body).not.toBeNull()
    })
})

describe('GET /recommendations/:id', () => {
    it('should answer with requested recomendation', async () => {
        const recomendationData = {
            name: faker.random.words(),
            youtubeLink: "https://www.youtube.com/watch?v=" + faker.random.alphaNumeric(8)
        }
        const recommendation = await prisma.recommendation.create({
            data: recomendationData
        })

        const response = await agent.get(`/recommendations/${recommendation.id}`)

        expect(response.body).not.toBeNull()
    })

    it('should answer with status 404 when recommendation is not found', async () => {
        const response = await agent.get(`/recommendations/0`)

        expect(response.status).toBe(404)
    })
})

describe('POST /recommendations/:id/upvote', () => {
    it('should answer with status 400 when all data is correct', async () => {
        const recomendationData = {
            name: faker.random.words(),
            youtubeLink: "https://www.youtube.com/watch?v=" + faker.random.alphaNumeric(8)
        }
        const recommendation = await prisma.recommendation.create({
            data: recomendationData
        })

        const response = await agent.post(`/recommendations/${recommendation.id}/upvote`)

        const upvotedRecommendation = await prisma.recommendation.findFirst({
            where: {
                name: recomendationData.name
            }
        })

        expect(response.status).toBe(200)
        expect(upvotedRecommendation.score).toBe(1)
    })

    it('should answer with status 404 given id is not registered', async () => {
        const response = await agent.post(`/recommendations/0/upvote`)

        expect(response.status).toBe(404)
    })
})

describe('POST /recommendations/:id/downvote', () => {
    it('should answer with status 400 when all data is correct', async () => {
        const recomendationData = {
            name: faker.random.words(),
            youtubeLink: "https://www.youtube.com/watch?v=" + faker.random.alphaNumeric(8)
        }
        const recommendation = await prisma.recommendation.create({
            data: recomendationData
        })

        const response = await agent.post(`/recommendations/${recommendation.id}/downvote`)

        const downvotedRecommendation = await prisma.recommendation.findFirst({
            where: {
                name: recomendationData.name
            }
        })

        expect(response.status).toBe(200)
        expect(downvotedRecommendation.score).toBe(-1)
    })

    it('should answer with status 404 given id is not registered', async () => {
        const response = await agent.post(`/recommendations/0/downvote`)

        expect(response.status).toBe(404)
    })
})