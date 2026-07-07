import { Controller, Get, Headers } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { Public } from "../common/decorators/public.decorator"
import { I18nService } from "./i18n.service"

@ApiTags("Internationalisation")
@Controller("i18n")
export class I18nController {
  constructor(private readonly i18n: I18nService) {}

  @Public()
  @Get("translations")
  @ApiOperation({ summary: "Récupérer les traductions pour la langue demandée" })
  getTranslations(@Headers("accept-language") acceptLanguage?: string) {
    const lang = acceptLanguage?.split(",")[0]?.trim()?.substring(0, 2) ?? "fr"
    return { lang, translations: this.i18n.getTranslations(lang) }
  }

  @Public()
  @Get("languages")
  @ApiOperation({ summary: "Langues supportées" })
  getLanguages() {
    return { languages: this.i18n.supportedLanguages() }
  }
}
