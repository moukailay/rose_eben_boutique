import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { validateHerbOrderWorkflow } from "../../../../workflows/validate-herb-order"

interface ValidateOrderRequest {
  order_id: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { order_id } = req.body as ValidateOrderRequest

  if (!order_id) {
    return res.status(400).json({
      error: "L'ID de commande est requis"
    })
  }

  try {
    // Exécuter le workflow de validation
    const { result } = await validateHerbOrderWorkflow(req.scope).run({
      input: { order_id }
    })

    res.json({
      success: true,
      validation_result: result
    })
  } catch (error) {
    console.error('Erreur lors de la validation de commande:', error)
    res.status(500).json({
      error: "Erreur lors de la validation de la commande",
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}
