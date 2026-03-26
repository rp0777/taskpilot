import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('TaskPilot API')
    .setDescription(
      'REST API for the TaskPilot Kanban board application. ' +
        'Manage boards, columns, and tasks with full CRUD operations, ' +
        'drag-and-drop reordering, and cross-column task movement.',
    )
    .setVersion('1.0')
    .addTag('Boards', 'Operations for managing Kanban boards')
    .addTag('Columns', 'Operations for managing columns within a board')
    .addTag('Tasks', 'Operations for managing tasks within columns')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.API_PORT || 4000);
}
bootstrap();
