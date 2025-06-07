import { MedusaService } from "@medusajs/framework/utils"
import Herb from "./models/herb"

class HerbalistModuleService extends MedusaService({
  Herb
}) {
  async getHerbsByOrigin(origin: string) {
    return await this.listHerbs({ 
      where: { origin } 
    })
  }

  async getSeasonalHerbs(season: string) {
    return await this.listHerbs({ 
      where: { harvesting_season: season } 
    })
  }

  async getHerbByProductId(productId: string) {
    const herbs = await this.listHerbs({ 
      where: { product_id: productId } 
    })
    return herbs[0] || null
  }

  async createHerb(data: {
    name: string
    botanical_name?: string
    properties?: any
    harvesting_season?: string
    origin?: string
    certification?: string
    product_id?: string
  }) {
    return await this.createHerbs(data)
  }

  async updateHerb(id: string, data: Partial<{
    name: string
    botanical_name: string
    properties: any
    harvesting_season: string
    origin: string
    certification: string
    product_id: string
  }>) {
    return await this.updateHerbs({ id, ...data })
  }
}

export default HerbalistModuleService
