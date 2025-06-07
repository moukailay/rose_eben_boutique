import { model } from "@medusajs/framework/utils"

const Herb = model.define("herb", {
  id: model.id().primaryKey(),
  name: model.text(),
  botanical_name: model.text().nullable(),
  properties: model.json().nullable(), // Propriétés médicinales
  harvesting_season: model.text().nullable(),
  origin: model.text().nullable(), // Québec, local, etc.
  certification: model.text().nullable(), // Bio, naturel, etc.
  product_id: model.text().nullable(), // Lien avec Product
  created_at: model.dateTime().default(new Date()),
  updated_at: model.dateTime().default(new Date())
})

export default Herb
export { Herb }
