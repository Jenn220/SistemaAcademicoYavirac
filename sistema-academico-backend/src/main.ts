import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Asegúrate de que esta ruta apunte a tu app.module.ts

async function bootstrap() {
  console.log('NestJS backend starting...'); 
  
  // 1. Crea la instancia de la aplicación
  const app = await NestFactory.create(AppModule);
  
  // 2. Habilita CORS si planeas conectarlo con un frontend (opcional pero recomendado)
  app.enableCors();

  // 3. Pone al servidor a "escuchar" en el puerto 3000. ¡Esto evita que se cierre!
  await app.listen(3000);
  
  console.log('Backend corriendo exitosamente en el puerto 3000 🚀');
}

// ¡Esta línea final es crucial! Si falta, la función nunca se ejecuta y el programa termina de golpe.
bootstrap();