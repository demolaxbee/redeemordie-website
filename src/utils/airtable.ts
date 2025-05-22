export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    stock: number;
    imageUrl: string;
  }
  
  const AIRTABLE_TOKEN = process.env.REACT_APP_AIRTABLE_PAT;
  const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;  
  const TABLE_NAME = process.env.REACT_APP_AIRTABLE_TABLE_NAME;
  
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
        imageUrl: record.fields.Image?.[0]?.thumbnails?.large?.url|| '',
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };
  