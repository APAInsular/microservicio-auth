// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'; // Importa los tipos de Next.js para las solicitudes y respuestas
import jwt from 'jsonwebtoken'; // Importa la librería jsonwebtoken para generar el token
//import bcrypt from 'bcryptjs'; // Importa bcryptjs para comparar la contraseña encriptada
import { RowDataPacket, FieldPacket } from 'mysql2'; // Importa los tipos de mysql2 para las filas de datos y metadatos
import { createDynamicConnection } from '../../../lib/db'; // Función para crear una conexión dinámica a la base de datos
import { LoginRequest, JwtPayload } from '../../../types'; // Tipos personalizados para las solicitudes y payload del JWT

// Función de autenticación que maneja la solicitud de login
export default async function login(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // Verificar si el método de la solicitud es POST, si no, devolver un error 405 (Método no permitido)
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']); // Establece los métodos permitidos para la ruta
        res.status(405).end(`Method ${req.method || 'UNKNOWN'} Not Allowed`); // Responde con un error 405
        return;
    }

    // Extraer el email, la contraseña y la configuración de la base de datos del cuerpo de la solicitud
    const { email, password, dbConfig }: LoginRequest = req.body;

    // Verificar que se ha proporcionado la configuración de la base de datos
    if (!dbConfig) {
        return res.status(400).json({ error: 'Database configuration is required' }); // Si falta la configuración de la base de datos, devuelve un error 400
    }

    try {
        // Crear la conexión dinámica a la base de datos usando la configuración proporcionada
        const db = await createDynamicConnection(dbConfig);

        // Consultar la base de datos para buscar al usuario con el correo electrónico proporcionado
        const [rows] = await db.execute('SELECT * FROM worker WHERE email = ?', [email]) as [RowDataPacket[], FieldPacket[]];

        // Si no se encuentran filas (es decir, el usuario no existe), devolver un error 404
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extraer el primer usuario encontrado (se asume que email es único)
        const user = rows[0] as { email: string; password: string, id: number };

        // Comparar la contraseña proporcionada con la almacenada en la base de datos
        if (password !== user.password) {
            // Si las contraseñas no coinciden, devolver un error 401 (credenciales no válidas)
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generar el token JWT con los datos del usuario (email y rol)
        const token = jwt.sign(
            { email: user.email } as JwtPayload, // Payload del token con el email y el rol del usuario
            process.env.JWT_SECRET as string, // La clave secreta para firmar el token (debería estar en el archivo .env)
            { expiresIn: process.env.JWT_EXPIRATION } // La duración del token (1h por defecto)
        );

        // Devolver el token JWT al cliente
        res.status(200).json(
            {
                token: token,
                idUser: user.id
            }
        );

    } catch (error: unknown) {
        // Verificar que el error tiene la propiedad `message` antes de acceder a ella
        if (error instanceof Error) {
            res.status(500).json({ error: error.message }); // Ahora `error.message` es seguro de usar
        } else {
            res.status(500).json({ error: 'An unknown error occurred' }); // Si no es una instancia de Error, respondemos con un mensaje genérico
        }
    }
}
