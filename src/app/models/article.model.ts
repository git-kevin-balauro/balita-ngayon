
export interface ArticleModel {
    author: string | null;
    title: string;
    description: string;
    url: string;
    source: string;
    image: string | null;
    category: string;
    language: string;
    country: string;
    published_at: string;
}
