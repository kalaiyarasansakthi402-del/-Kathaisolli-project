import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('home')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300')
  @ApiOperation({ summary: 'Get published homepage collections' })
  getHome() {
    return this.catalog.getHome();
  }

  @Get('categories')
  @Header('Cache-Control', 'public, max-age=120, s-maxage=600')
  listCategories() {
    return this.catalog.listCategories();
  }

  @Get('languages')
  @Header('Cache-Control', 'public, max-age=300, s-maxage=1800')
  listLanguages() {
    return this.catalog.listLanguages();
  }

  @Get('series')
  @Header('Cache-Control', 'public, max-age=30, s-maxage=120')
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
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300')
  listEpisodes(@Param('slug') slug: string) {
    return this.catalog.listEpisodes(slug);
  }

  @Get('series/:slug')
  @Header('Cache-Control', 'public, max-age=60, s-maxage=300')
  getSeries(@Param('slug') slug: string) {
    return this.catalog.getSeries(slug);
  }
}
