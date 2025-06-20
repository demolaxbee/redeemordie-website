export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    stock: number;
    imageUrls: string[];
    sizes?: string[];
  }

  const AIRTABLE_TOKEN = process.env.REACT_APP_AIRTABLE_PAT!;
  const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID!;  
  const TABLE_NAME = process.env.REACT_APP_AIRTABLE_TABLE_NAME!;

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
        stock: record.fields.Stock,
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
    // Format the data for Airtable
    const fields = {
      Name: product.name,
      Price: product.price,
      Category: product.category,
      Description: product.description,
      Stock: product.stock,
      // Airtable expects image URLs to be in a specific format for attachment fields
      Image: product.imageUrls.map(url => ({ url })),
      Size: product.sizes || [],
    };

    console.log('Adding to Airtable with fields:', fields);

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable add error:', errorData);
      throw new Error(`Airtable error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Airtable add response:', data);
    
    return {
      id: data.id,
      name: data.fields.Name,
      price: data.fields.Price,
      category: data.fields.Category,
      description: data.fields.Description,
      stock: data.fields.Stock,
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

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    // Format the data for Airtable
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

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable update error:', errorData);
      throw new Error(`Airtable error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Airtable update response:', data);
    
    return {
      id: data.id,
      name: data.fields.Name,
      price: data.fields.Price,
      category: data.fields.Category,
      description: data.fields.Description,
      stock: data.fields.Stock,
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

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Airtable error: ${errorData.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error deleting product from Airtable:', error);
    throw error;
  }
};
  