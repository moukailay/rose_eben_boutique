// packages/backend/src/admin/widgets/herb-dashboard.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const HerbDashboardWidget = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Gestion Herboristerie</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">24</p>
          <p className="text-sm text-gray-600">Herbes en saison</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">89%</p>
          <p className="text-sm text-gray-600">Stock disponible</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">15</p>
          <p className="text-sm text-gray-600">Nouvelles récoltes</p>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before"
})

export default HerbDashboardWidget