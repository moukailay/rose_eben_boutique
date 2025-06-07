import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function setFeaturedProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModuleService = container.resolve(Modules.PRODUCT)

  try {
    logger.info("Configuration du produit vedette...")

    // Lister tous les produits pour en choisir un
    const products = await productModuleService.listProducts()
    
    if (products.length === 0) {
      logger.error("Aucun produit trouvé. Exécutez d'abord le script de seed.")
      return
    }

    // Prendre le premier produit disponible
    const product = products[0]
    logger.info(`Configuration du produit: ${product.title}`)

    // Utiliser des prix fixes pour la démonstration
    const currentPrice = 2500 // 25.00$ en centimes
    const originalPrice = 3250 // 32.50$ en centimes (30% plus élevé)

    // Mettre à jour le produit avec les métadonnées pour la bannière
    await productModuleService.updateProducts(product.id, {
      metadata: {
        featured: "true",
        badge: "Nouveau",
        limitedOffer: "true",
        rating: "4.8",
        reviews: "156",
        original_price: originalPrice.toString()
      }
    })

    logger.info(`Produit vedette configuré avec succès: ${product.title}`)
    logger.info(`ID du produit: ${product.id}`)
    logger.info(`Prix original défini: ${originalPrice} centimes (${originalPrice/100}$)`)
    
  } catch (error) {
    logger.error("Erreur lors de la configuration du produit vedette:", error)
    throw error
  }
}
