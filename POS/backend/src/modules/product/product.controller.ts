import { Request, Response } from 'express';
import * as productService from './product.service.js';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const data = await productService.getCategories();
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const data = await productService.createCategory(req.body.name);
        res.status(201).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const data = await productService.getProducts(req.query);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const productData = req.body;
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }
        const data = await productService.createProduct(productData);
        res.status(201).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productData = req.body;
        if (req.file) {
            productData.image = `/uploads/${req.file.filename}`;
        }
        const data = await productService.updateProduct(id as string, productData);
        res.status(200).json({ status: 'success', data });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id as string);
        res.status(200).json({ status: 'success', message: 'Product deleted' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
