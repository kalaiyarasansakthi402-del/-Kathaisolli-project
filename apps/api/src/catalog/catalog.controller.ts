import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('home')
  @ApiOperation({ summary: 'Get published homepage collections' })
  getHome() {
    return this.catalog.getHome();
  }

  @Get('categories')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get('languages')
  listLanguages() {
    return this.catalog.listLanguages();
  }

  @Get('series')
  @ApiQuery({ type: CatalogQueryDto })
  listSeries(@Query() query: CatalogQueryDto) {
    return this.catalog.listSeries(query);
  }

  @Get('search')
  @ApiQuery({ type: CatalogQueryDto })
  search(@Query() query: CatalogQueryDto) {
    return this.catalog.listSeries(query);
  }

  @Get('series/:slug/episodes')
  listEpisodes(@Param('slug') slug: string) {
    return this.catalog.listEpisodes(slug);
  }

  @Get('series/:slug')
  getSeries(@Param('slug') slug: string) {
    return this.catalog.getSeries(slug);
  }
}
