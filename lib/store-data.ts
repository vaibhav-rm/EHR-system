export type Medicine = {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
};

export const MEDICINE_CATEGORIES = [
    "General Health",
    "Pain Relief",
    "Cold & Flu",
    "Vitamins",
    "First Aid",
];

export const MEDICINE_CATALOG: Medicine[] = [
    {
        id: "med-1",
        name: "Paracetamol 500mg",
        category: "Pain Relief",
        price: 5.00,
        description: "Effective relief from headache, toothache, and fever.",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80",
    },
    {
        id: "med-2",
        name: "Vitamin C 1000mg",
        category: "Vitamins",
        price: 12.50,
        description: "Supports immune system health and reduces tiredness.",
        image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&q=80",
    },
    {
        id: "med-3",
        name: "Amoxicillin 250mg",
        category: "Antibiotics",
        price: 15.00,
        description: "Antibiotic used to treat a number of bacterial infections.",
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80",
    },
    {
        id: "med-4",
        name: "Cough Syrup",
        category: "Cold & Flu",
        price: 8.99,
        description: "Relief from dry and tickly coughs.",
        image: "https://images.unsplash.com/photo-1512069772995-ec65ed456d32?w=300&q=80",
    },
    {
        id: "med-5",
        name: "Bandages (Pack of 10)",
        category: "First Aid",
        price: 3.50,
        description: "Waterproof bandages for minor cuts and scrapes.",
        image: "https://images.unsplash.com/photo-1526402373070-55e1a3962b3a?w=300&q=80",
    },
    {
        id: "med-6",
        name: "Ibuprofen 200mg",
        category: "Pain Relief",
        price: 6.00,
        description: "Anti-inflammatory pain relief for back pain and muscle aches.",
        image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&q=80",
    }
];
