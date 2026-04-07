import { Module } from '@nestjs/common';
import { AdminProjectsController } from './projects.controller';
import { ProjectsController } from './projects-public.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [AdminProjectsController, ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
