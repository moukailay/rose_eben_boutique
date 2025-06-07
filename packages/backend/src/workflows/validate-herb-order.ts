// packages/backend/src/workflows/validate-herb-order.ts
import { 
  createWorkflow, 
  WorkflowResponse,
  createStep,
  StepResponse
} from "@medusajs/framework/workflows-sdk"
import { 
  ContainerRegistrationKeys,
  Modules 
} from "@medusajs/framework/utils"

// Type definitions
interface SeasonalValidationInput {
  order_id: string
}

interface SeasonalValidationResult {
  is_valid: boolean
  out_of_season_items: string[]
  message: string
}

interface CertificationValidationResult {
  is_valid: boolean
  invalid_certifications: string[]
  message: string
}

interface DeliveryCalculationResult {
  estimated_days: number
  special_handling_required: boolean
  delivery_notes: string[]
}

// Step: Validate Seasonal Availability
const validateSeasonalAvailabilityStep = createStep(
  "validate-seasonal-availability",
  async function ({ order_id }: SeasonalValidationInput, { container }) {
    const orderModuleService = container.resolve(Modules.ORDER)
    const productModuleService = container.resolve(Modules.PRODUCT)
    
    try {
      // Récupérer la commande avec ses items
      const order = await orderModuleService.retrieveOrder(order_id, {
        relations: ["items"]
      })

      const currentMonth = new Date().getMonth() + 1 // 1-12
      const currentSeason = getSeason(currentMonth)
      
      const outOfSeasonItems: string[] = []
      
      // Vérifier chaque item de la commande
      for (const item of order.items || []) {
        try {
          // Récupérer le produit via le product_id de l'item
          if (item.product_id) {
            const product = await productModuleService.retrieveProduct(item.product_id)
            
            if (product?.metadata?.harvesting_season) {
              const productSeason = product.metadata.harvesting_season as string
              if (!isSeasonallyAvailable(productSeason, currentSeason)) {
                outOfSeasonItems.push(product.title || 'Produit inconnu')
              }
            }
          }
        } catch (productError) {
          console.warn(`Impossible de récupérer le produit pour l'item ${item.id}:`, productError)
        }
      }

      const result: SeasonalValidationResult = {
        is_valid: outOfSeasonItems.length === 0,
        out_of_season_items: outOfSeasonItems,
        message: outOfSeasonItems.length > 0 
          ? `Certains produits ne sont pas en saison: ${outOfSeasonItems.join(', ')}`
          : 'Tous les produits sont disponibles selon la saison'
      }

      return new StepResponse(result)
    } catch (error) {
      throw new Error(`Erreur lors de la validation saisonnière: ${error}`)
    }
  }
)

// Step: Validate Certifications
const validateCertificationsStep = createStep(
  "validate-certifications",
  async function ({ order_id }: SeasonalValidationInput, { container }) {
    const orderModuleService = container.resolve(Modules.ORDER)
    const productModuleService = container.resolve(Modules.PRODUCT)
    
    try {
      const order = await orderModuleService.retrieveOrder(order_id, {
        relations: ["items"]
      })

      const invalidCertifications: string[] = []
      
      // Vérifier les certifications de chaque produit
      for (const item of order.items || []) {
        try {
          if (item.product_id) {
            const product = await productModuleService.retrieveProduct(item.product_id)
            
            if (product?.metadata?.certification) {
              const certification = product.metadata.certification as string
              if (!isValidCertification(certification)) {
                invalidCertifications.push(`${product.title}: ${certification}`)
              }
            }
          }
        } catch (productError) {
          console.warn(`Impossible de récupérer le produit pour l'item ${item.id}:`, productError)
        }
      }

      const result: CertificationValidationResult = {
        is_valid: invalidCertifications.length === 0,
        invalid_certifications: invalidCertifications,
        message: invalidCertifications.length > 0
          ? `Certifications invalides: ${invalidCertifications.join(', ')}`
          : 'Toutes les certifications sont valides'
      }

      return new StepResponse(result)
    } catch (error) {
      throw new Error(`Erreur lors de la validation des certifications: ${error}`)
    }
  }
)

// Step: Calculate Herb Delivery
const calculateHerbDeliveryStep = createStep(
  "calculate-herb-delivery",
  async function ({ order_id }: SeasonalValidationInput, { container }) {
    const orderModuleService = container.resolve(Modules.ORDER)
    const productModuleService = container.resolve(Modules.PRODUCT)
    
    try {
      const order = await orderModuleService.retrieveOrder(order_id, {
        relations: ["items", "shipping_address"]
      })

      let estimatedDays = 3 // Base delivery time
      let specialHandlingRequired = false
      const deliveryNotes: string[] = []
      
      // Analyser chaque produit pour ajuster la livraison
      for (const item of order.items || []) {
        try {
          if (item.product_id) {
            const product = await productModuleService.retrieveProduct(item.product_id)
            
            // Produits frais nécessitent une livraison rapide
            if (product?.metadata?.requires_fresh_handling === 'true') {
              specialHandlingRequired = true
              deliveryNotes.push(`${product.title} nécessite une livraison réfrigérée`)
              estimatedDays = Math.max(estimatedDays, 2) // Minimum 2 jours pour produits frais
            }
            
            // Produits saisonniers peuvent prendre plus de temps
            if (product?.metadata?.harvesting_season) {
              const currentMonth = new Date().getMonth() + 1
              const productSeason = product.metadata.harvesting_season as string
              
              if (!isSeasonallyAvailable(productSeason, getSeason(currentMonth))) {
                estimatedDays += 7 // Délai supplémentaire pour produits hors saison
                deliveryNotes.push(`${product.title} est hors saison, délai supplémentaire`)
              }
            }
          }
        } catch (productError) {
          console.warn(`Impossible de récupérer le produit pour l'item ${item.id}:`, productError)
        }
      }
      
      // Ajustement selon la région de livraison
      const shippingAddress = order.shipping_address
      if (shippingAddress?.province && shippingAddress.province !== 'QC') {
        estimatedDays += 2 // Livraison hors Québec
        deliveryNotes.push('Livraison hors Québec, délai supplémentaire')
      }

      const result: DeliveryCalculationResult = {
        estimated_days: estimatedDays,
        special_handling_required: specialHandlingRequired,
        delivery_notes: deliveryNotes
      }

      return new StepResponse(result)
    } catch (error) {
      throw new Error(`Erreur lors du calcul de livraison: ${error}`)
    }
  }
)

// Workflow principal
export const validateHerbOrderWorkflow = createWorkflow(
  "validate-herb-order",
  function (input: { order_id: string }) {
    // Exécuter les validations en parallèle
    const seasonalCheck = validateSeasonalAvailabilityStep(input)
    const certificationCheck = validateCertificationsStep(input)
    const deliveryCalculation = calculateHerbDeliveryStep(input)
    
    return new WorkflowResponse({
      seasonal_validation: seasonalCheck,
      certification_validation: certificationCheck,
      delivery_calculation: deliveryCalculation,
      order_id: input.order_id,
      validation_timestamp: new Date().toISOString()
    })
  }
)

// Fonctions utilitaires
function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

function isSeasonallyAvailable(productSeason: string, currentSeason: string): boolean {
  // Les produits "all-year" sont toujours disponibles
  if (productSeason === 'all-year') return true
  
  // Vérifier si la saison actuelle correspond
  if (productSeason === currentSeason) return true
  
  // Logique spéciale pour les saisons étendues
  const seasonMap: Record<string, string[]> = {
    'spring-summer': ['spring', 'summer'],
    'summer-autumn': ['summer', 'autumn'],
    'autumn-winter': ['autumn', 'winter'],
    'winter-spring': ['winter', 'spring']
  }
  
  return seasonMap[productSeason]?.includes(currentSeason) || false
}

function isValidCertification(certification: string): boolean {
  const validCertifications = [
    'bio',
    'naturel',
    'artisanal',
    'local',
    'quebec',
    'organic',
    'wildcrafted',
    'sustainable'
  ]
  
  return validCertifications.includes(certification.toLowerCase())
}