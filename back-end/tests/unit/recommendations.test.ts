import { faker } from "@faker-js/faker"
import { recommendationRepository } from "../../src/repositories/recommendationRepository"
import { recommendationService, CreateRecommendationData } from "../../src/services/recommendationsService"

describe("Insert Recomendation", () => {
	it("should insert a recommendation", async () => {
        const recommendationData: CreateRecommendationData  = {
            name: faker.random.words(),
            youtubeLink: faker.internet.url()
        }

        jest
            .spyOn(recommendationRepository, "findByName")
            .mockImplementationOnce((): any => {})

        jest
            .spyOn(recommendationRepository, "create")
            .mockImplementationOnce((): any => {})


		await recommendationService.insert(recommendationData)

		expect(recommendationRepository.findByName).toBeCalled()
        expect(recommendationRepository.create).toBeCalled()
	})

    it("should not insert duplicates", () => {
        const recommendationData: CreateRecommendationData  = {
            name: faker.random.words(),
            youtubeLink: faker.internet.url()
        }

        jest
            .spyOn(recommendationRepository, "findByName")
            .mockImplementationOnce((): any => recommendationData)

		const promise = recommendationService.insert(recommendationData)

		expect(promise).rejects.toEqual({type: "conflict", message: "Recommendations names must be unique"})
	})
})

describe("Upvote Recomendation", () => {
	it("should upvote a recommendation", async () => {
        const id = Math.floor(Math.random() * 99)

        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {return {object: true} })

        jest
            .spyOn(recommendationRepository, "updateScore")
            .mockImplementationOnce((): any => {})


		await recommendationService.upvote(id)

		expect(recommendationRepository.updateScore).toBeCalled()
        
	})
})

describe("Downvote Recomendation", () => {
    it("should downvote a recommendation", async () => {
        const recommendation = {
            id: Math.floor(Math.random() * 99),
            name: faker.random.words(),
            youtubeLink: faker.internet.url(),
            score: 5
        }
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {return recommendation })

        jest
            .spyOn(recommendationRepository, "updateScore")
            .mockImplementationOnce((): any => {return recommendation})


        await recommendationService.downvote(recommendation.id)

        expect(recommendationRepository.updateScore).toBeCalled()
    })

    it("should remove a recommendation", async () => {
        const recommendation = {
            id: Math.floor(Math.random() * 99),
            name: faker.random.words(),
            youtubeLink: faker.internet.url(),
            score: -6
        }
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {return recommendation})

        jest
            .spyOn(recommendationRepository, "updateScore")
            .mockImplementationOnce((): any => {return recommendation})

        jest
            .spyOn(recommendationRepository, "remove")
            .mockImplementationOnce((): any => {})


        await recommendationService.downvote(recommendation.id)

        expect(recommendationRepository.remove).toBeCalled()
    })
})

describe("Get Recommendation by Id", () => {
    it("should return found recommendation", async () => {
        const id = Math.floor(Math.random() * 99)

        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {return {object: true} })

        const result = await recommendationService.getById(id)

        expect(result).toStrictEqual({object: true})
    })

    it("should not found recommendation", async () => {
        const id = Math.floor(Math.random() * 99)

        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any =>  null)

        const promise = recommendationService.getById(id)

        expect(promise).rejects.toEqual({type: "not_found", message: ""})
    })
})

describe("Get All Recommendations", () => {
    it("should return all recommendations", async () => {
        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => {return {object: true} })

        const result = await recommendationService.get()

        expect(result).toStrictEqual({object: true})
    })
})

describe("Get Top Recommendations", () => {
    it("should return top recommendations", async () => {
        const amount = Math.floor(Math.random() * 99)
        jest
            .spyOn(recommendationRepository, "getAmountByScore")
            .mockImplementationOnce((): any => {return {object: true} })

        const result = await recommendationService.getTop(amount)

        expect(result).toStrictEqual({object: true})
    })
})

describe("Get Random Recommendation", () => {
    it("should return random recommendation", async () => {

        jest
            .spyOn(Math, "random")
            .mockImplementationOnce((): any => 0.7)

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => {return [{object: true}] })

        const result = await recommendationService.getRandom()

        expect(result).toStrictEqual({object: true})
    })

    it("should not return random recommendation", async () => {

        jest
            .spyOn(Math, "random")
            .mockImplementationOnce((): any => 0.7)

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => {return [] })

        const result = recommendationService.getRandom()

        expect(result).rejects.toEqual({type: "not_found", message: ""})
    })
})

