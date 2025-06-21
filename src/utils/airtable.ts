/**
 * Product interface representing the structure of product data
 * Maps to Airtable fields and provides type safety
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;
  /** Product name/title */
  name: string;
  /** Product price in base currency (CAD) */
  price: number;
  /** Product category for filtering */
  category: string;
  /** Detailed product description */
  description: string;
  /** Current stock quantity */
  stock: number;
  /** Array of product image URLs */
  imageUrls: string[];
  /** Available sizes for the product (optional) */
  sizes?: string[];
}

// Environment variables for Airtable configuration
const AIRTABLE_TOKEN = process.env.REACT_APP_AIRTABLE_PAT!;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID!;  
const TABLE_NAME = process.env.REACT_APP_AIRTABLE_TABLE_NAME!;

// Validate that all required environment variables are present
if (!AIRTABLE_TOKEN || !BASE_ID || !TABLE_NAME) {
  throw new Error('Airtable configuration incomplete - missing required environment variables');
}  

/**
 * Fetch all products from Airtable
 * 
 * Retrieves product data from the configured Airtable base and table,
 * transforming the Airtable record format to our Product interface.
 * 
 * @returns {Promise<Product[]>} Array of product objects
 * @throws {Error} When API request fails or data is malformed
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Make API request to Airtable
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Transform Airtable records to Product objects
    return data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name,
      price: record.fields.Price,
      category: record.fields.Category,
      description: record.fields.Description,
      stock: record.fields.Stock,
      // Handle image URLs with fallbacks for different thumbnail sizes
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

/**
 * Add a new product to Airtable
 * 
 * Creates a new record in the Airtable base with the provided product data.
 * Handles image URL formatting for Airtable attachment fields.
 * 
 * @param {Product} product - Product data to add
 * @returns {Promise<Product>} The created product with Airtable ID
 * @throws {Error} When API request fails or validation errors occur
 */
export const addProduct = async (product: Product): Promise<Product> => {
  try {
    // Format the data for Airtable API
    const fields = {
      Name: product.name,
      Price: product.price,
      Category: product.category,
      Description: product.description,
      Stock: product.stock,
      // Convert image URLs to Airtable attachment format
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
      stock: data.fields.Stock,
      // Extract image URLs from Airtable response
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
    if (product.stock !== undefined) fields.Stock = product.stock;
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
      stock: data.fields.Stock,
      // Extract image URLs from Airtable response
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
  