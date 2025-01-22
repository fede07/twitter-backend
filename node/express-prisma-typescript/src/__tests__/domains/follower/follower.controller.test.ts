import request from 'supertest'
import { Router } from 'express'
import express from 'express'
import HttpStatus from 'http-status'
import { App } from 'supertest/types'

// Mock del servicio "FollowerService" original
const mockFollowerService = {
  followUser: jest.fn() // Creamos un mock de la función que vamos a probar
}

// Mock del router de seguidores
const createFollowerRouter = () => {
  const app = express()
  app.use(express.json()) // Middleware necesario para manejar JSON en solicitudes
  const followerRouter = Router()

  followerRouter.post('/follow/:user_id', async (req, res) => {
    const { userId } = res.locals.context || { userId: 'mockUserId' } // Añadimos un id de usuario ficticio (res.locals.context)
    const { user_id } = req.params

    try {
      // Llamamos al method de la capa de servicio (mockeado)
      await mockFollowerService.followUser(user_id, userId)
      res.status(HttpStatus.CREATED).json({
        user: user_id,
        message: 'User followed successfully'
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({"error": (error as Error).message })
    }
  })

  app.use('/follower', followerRouter)
  return app
}

// Prueba del controlador de seguidores
describe('Follower Controller', () => {
  let app: App

  // Configuración de la aplicación y el router antes de cada test
  beforeEach(() => {
    app = createFollowerRouter()
  })

  it('should return 201 when a user is followed successfully', async () => {
    // Simulamos que el mock del servicio no lanza errores
    mockFollowerService.followUser.mockResolvedValueOnce(undefined)

    const response = await request(app)
      .post('/follower/follow/targetUserId') // Usamos el endpoint de prueba
      .send() // No enviamos ningún body aquí, ya que solo usamos parámetros de ruta

    // Validamos el status del servidor y el resultado esperado
    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      user: 'targetUserId',
      message: 'User followed successfully',
    })

    // Verificamos que la función "followUser" haya sido llamada con los argumentos esperados
    expect(mockFollowerService.followUser).toHaveBeenCalledWith(
      'targetUserId',
      'mockUserId' // el ID del usuario ficticio que configuramos en res.locals.context
    )
  })

  it('should return 500 if there is an error', async () => {
    // Simulamos que el mock del servicio lanza un error
    mockFollowerService.followUser.mockRejectedValueOnce(new Error('Something went wrong'))

    const response = await request(app).post('/follower/follow/targetUserId').send()

    // Verificamos el estatus de error
    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Something went wrong' })

    // Aseguramos que el method fuera llamado antes del error
    expect(mockFollowerService.followUser).toHaveBeenCalledWith('targetUserId', 'mockUserId')
  })
})
