import { Module } from "@medusajs/framework/utils"
import HerbalistModuleService from "./service"
import Herb from "./models/herb"

export const HERBALIST_MODULE = "herbalistModuleService"

export default Module(HERBALIST_MODULE, {
  service: HerbalistModuleService,
})

export { Herb }
export { HerbalistModuleService }
export * from "./models/herb"
export * from "./service"
