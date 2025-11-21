export interface ProductStock {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: ProductStock;
  imageUrls: string[];
  sizes?: string[];
}

const AIRTABLE_TOKEN = process.env.REACT_APP_AIRTABLE_PAT!;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID!;
const TABLE_NAME = process.env.REACT_APP_AIRTABLE_TABLE_NAME!;

export const EMPTY_STOCK: ProductStock = {
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
};

const mapStockFields = (fields: Record<string, any>): ProductStock => ({
  XS: fields.Stock_XS || 0,
  S: fields.Stock_S || 0,
  M: fields.Stock_M || 0,
  L: fields.Stock_L || 0,
  XL: fields.Stock_XL || 0,
  XXL: fields.Stock_XXL || 0,
});

if (!AIRTABLE_TOKEN || !BASE_ID || !TABLE_NAME) {
  throw new Error('Airtable configuration incomplete');
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name,
      price: record.fields.Price,
      category: record.fields.Category,
      description: record.fields.Description,
      stock: mapStockFields(record.fields),
      imageUrls: record.fields.Image?.map((img: any) =>
        img?.url || img?.thumbnails?.large?.url || img?.thumbnails?.full?.url || ''
      ).filter(Boolean) || [],
      sizes: record.fields.Size || [],
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (product: Product): Promise<Product> => {
  try {
    // Format the data for Airtable API
    const fields = {
      Name: product.name,
      Price: product.price,
      Category: product.category,
      Description: product.description,
      Stock_XS: product.stock?.XS ?? 0,
      Stock_S: product.stock?.S ?? 0,
      Stock_M: product.stock?.M ?? 0,
      Stock_L: product.stock?.L ?? 0,
      Stock_XL: product.stock?.XL ?? 0,
      Stock_XXL: product.stock?.XXL ?? 0,
      // Airtable expects image URLs to be in a specific format for attachment fields
      Image: product.imageUrls.map(url => ({ url })),
      Size: product.sizes || [],
    };

    console.log('Adding to Airtable with fields:', fields);

    // Make POST request to create new record
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable add error:', errorData);
      throw new Error(`Airtable error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Airtable add response:', data);
    
    // Return the created product with Airtable ID
    return {
      id: data.id,
      name: data.fields.Name,
      price: data.fields.Price,
      category: data.fields.Category,
      description: data.fields.Description,
      stock: mapStockFields(data.fields),
      imageUrls: data.fields.Image?.map((img: any) => 
        img?.url || img?.thumbnails?.large?.url || img?.thumbnails?.full?.url || ''
      ).filter(Boolean) || [],
      sizes: data.fields.Size || [],
    };
  } catch (error) {
    console.error('Error adding product to Airtable:', error);
    throw error;
  }
};

/**
 * Update an existing product in Airtable
 * 
 * Updates a specific record in Airtable with partial product data.
 * Only updates fields that are provided in the product parameter.
 * 
 * @param {string} id - Airtable record ID to update
 * @param {Partial<Product>} product - Partial product data to update
 * @returns {Promise<Product>} The updated product
 * @throws {Error} When API request fails or record not found
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    // Build fields object with only provided values
    const fields: any = {};
    
    if (product.name !== undefined) fields.Name = product.name;
    if (product.price !== undefined) fields.Price = product.price;
    if (product.category !== undefined) fields.Category = product.category;
    if (product.description !== undefined) fields.Description = product.description;
    if (product.stock !== undefined) {
      fields.Stock_XS = product.stock.XS ?? 0;
      fields.Stock_S = product.stock.S ?? 0;
      fields.Stock_M = product.stock.M ?? 0;
      fields.Stock_L = product.stock.L ?? 0;
      fields.Stock_XL = product.stock.XL ?? 0;
      fields.Stock_XXL = product.stock.XXL ?? 0;
    }
    if (product.imageUrls !== undefined) {
      // Convert URLs to Airtable attachment format
      fields.Image = product.imageUrls.map(url => ({ url }));
    }
    if (product.sizes !== undefined) fields.Size = product.sizes;

    console.log('Updating Airtable with fields:', fields);

    // Make PATCH request to update existing record
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable update error:', errorData);
      throw new Error(`Airtable error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Airtable update response:', data);
    
    // Return the updated product
    return {
      id: data.id,
      name: data.fields.Name,
      price: data.fields.Price,
      category: data.fields.Category,
      description: data.fields.Description,
      stock: mapStockFields(data.fields),
      imageUrls: data.fields.Image?.map((img: any) => 
        img?.url || img?.thumbnails?.large?.url || img?.thumbnails?.full?.url || ''
      ).filter(Boolean) || [],
      sizes: data.fields.Size || [],
    };
  } catch (error) {
    console.error('Error updating product in Airtable:', error);
    throw error;
  }
};

/**
 * Delete a product from Airtable
 * 
 * Permanently removes a record from the Airtable base.
 * 
 * @param {string} id - Airtable record ID to delete
 * @returns {Promise<void>} Resolves when deletion is successful
 * @throws {Error} When API request fails or record not found
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // Make DELETE request to remove record
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Airtable error: ${errorData.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error deleting product from Airtable:', error);
    throw error;
  }
};
  
