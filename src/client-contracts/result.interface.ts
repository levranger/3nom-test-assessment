import { ShiurInterface } from './shiur.interface';

export interface ResultInterface {
    pageNumber: number;
    shiurList: ShiurInterface[];
    totalPageCount: number;
    totalResultCount: number;
}
