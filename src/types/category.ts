export interface Server {
    server_id: string;
    enabled: boolean
    server_name: string;
    order: number;
    categoryId: number;
    image_path: string | null;
    server_address: string | null;
    // Add other server properties as needed
}

export interface Category {
    id: number;
    name: string;
    servers: Server[];
    createdAt: Date;
    updatedAt: Date;
}