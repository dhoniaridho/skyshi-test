import Joi from 'joi'
import type { NextFunction, Request, Response } from 'express'
import { response } from '../../helpers/response'
import { mapError } from '../../helpers/validation'
import { TodoRepository } from './todo.repository'
import { schema, schemaUpdate } from './todo.schema'

export class TodoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const todoRepository = new TodoRepository()
    const query = req?.query?.activity_group_id
    const data = await todoRepository.getAll(query ? +query : null)
    return response(req, res).json(data)
  }

  async createOne(req: Request, res: Response) {
    const todoRepository = new TodoRepository()

    if (!req.body.activity_group_id) {
      return response(req, res).json(
        {},
        'Bad Request',
        'activity_group_id cannot be null',
        400
      )
    }

    try {
      const value = await schema.validateAsync(req.body)
      const data: any = await todoRepository.createOne(value)

      return response(req, res).json(
        {
          ...data,
          is_active: Boolean(data?.is_active)
        },
        'Success',
        'Success',
        201
      )
    } catch (error: any) {
      if (error) {
        return response(req, res).json(
          {},
          'Bad Request',
          mapError(error.message)[0],
          400
        )
      }
    }
  }
  async update(req: Request, res: Response) {
    const todoRepository = new TodoRepository()
    const { value, error } = schemaUpdate.validate(req.body)

    // validate any errors
    if (error) {
      return response(req, res).json(
        mapError(error.message),
        'Bad Request',
        'Bad Request',
        400
      )
    }

    const update = await todoRepository.updateOne(+req.params.id, value)

    // Handle 404
    if (!update)
      return response(req, res).json(
        {},
        'Not Found',
        `Todo with ID ${+req.params.id} Not Found`,
        404
      )

    return response(req, res).json(update, 'Success')
  }

  async getOne(req: Request, res: Response) {
    const todoRepository = new TodoRepository()
    const data = await todoRepository.getOne(+req.params.id)

    // Handle 404
    if (!data)
      return response(req, res).json(
        {},
        'Not Found',
        `Todo with ID ${+req.params.id} Not Found`,
        404
      )

    return response(req, res).json(data)
  }

  async deleteOne(req: Request, res: Response) {
    const todoRepository = new TodoRepository()
    const data = await todoRepository.deleteOne(+req.params.id)

    // Handle 404
    if (!data) {
      return response(req, res).json(
        {},
        'Not Found',
        `Todo with ID ${+req.params.id} Not Found`,
        404
      )
    }

    return response(req, res).json(
      {},
      'Success',
      `Data with id ID ${+req.params.id} was deleted`
    )
  }
}
