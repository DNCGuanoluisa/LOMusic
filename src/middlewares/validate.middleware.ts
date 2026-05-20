import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/** Nicolas Guanoluisa
 * Middleware de validación de datos de entrada usando Zod.
 * Actúa como un "guardia de seguridad" antes de que la petición llegue al controlador.
 * * @param schema - El esquema de Zod que contiene las reglas de validación.
 * @returns Una función middleware asíncrona de Express.
 */
export const validateTask = (schema: AnyZodObject) => {
    // Retornamos el middleware real de Express (req, res, next)
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // 1. INTENTO DE VALIDACIÓN: 
            // Compara el req.body (lo que envía el usuario) con las reglas del 'schema'.
            // Si todo está correcto, el código avanza. Si hay un error, salta al 'catch'.
            schema.parse(req.body);
            
            // 2. LUZ VERDE: 
            // Si la validación es exitosa, 'next()' le dice a Express que pase al siguiente middleware o controlador.
            next(); 

            //Nicolas Guanoluisa

        } catch (error) {
            // 3. MANEJO DE ERRORES DE ZOD:
            // Verificamos si el error fue lanzado específicamente por la validación de Zod.
            if (error instanceof ZodError) {
                // Respondemos con un código 400 (Bad Request) indicando que el usuario envió datos inválidos.
                res.status(400).json({
                    status: "error_validacion",
                    // Mapeamos el arreglo de errores de Zod para devolver una respuesta limpia y legible.
                    errors: error.errors.map(err => ({
                        campo: err.path[0], // Nombre del campo que falló (ej. 'title')
                        mensaje: err.message // Mensaje de error (ej. 'Requerido')
                    }))
                });
                return; // Detenemos la ejecución aquí para que no avance al controlador.
            }
            
            // 4. ERRORES DESCONOCIDOS:
            // Si ocurre un error de servidor que no tiene que ver con Zod, se lo pasamos al manejador de errores global de Express.
            //Nicolas Guanoluisa
            next(error); 
        }
    };
};