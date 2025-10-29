import { ArticleModel } from "./article.model"
import { PaginationModel } from "./pagination.model"

export interface NewsModel {
    pagination: PaginationModel
    data: ArticleModel[]
}

