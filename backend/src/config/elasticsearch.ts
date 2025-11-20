import { Client } from '@elastic/elasticsearch';

let client: Client | null = null;

export const getElasticsearchClient = (): Client | null => {
  return client;
};

export const isElasticsearchAvailable = (): boolean => {
  return client !== null;
};

export const connectElasticsearch = async (): Promise<void> => {
  const url = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  
  // Make Elasticsearch optional - don't fail if it's not available
  const ELASTICSEARCH_ENABLED = process.env.ELASTICSEARCH_ENABLED !== 'false';
  
  if (!ELASTICSEARCH_ENABLED) {
    console.log('⚠️  Elasticsearch is disabled (ELASTICSEARCH_ENABLED=false)');
    return;
  }

  client = new Client({
    node: url,
    requestTimeout: 5000,
    pingTimeout: 3000,
  });

  try {
    const health = await client.cluster.health();
    console.log('Elasticsearch cluster health:', health.status);

    // Create products index if it doesn't exist
    const indexExists = await client.indices.exists({ index: 'products' });
    if (!indexExists) {
      await client.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: {
                    type: 'completion',
                    analyzer: 'standard',
                  },
                },
              },
              description: { type: 'text' },
              brand: {
                type: 'keyword',
                fields: {
                  text: { type: 'text' },
                },
              },
              categories: { type: 'keyword' },
              price: { type: 'float' },
              mrp: { type: 'float' },
              discount: { type: 'integer' },
              size: { type: 'keyword' },
              color: { type: 'keyword' },
              rating: { type: 'float' },
              stock: { type: 'integer' },
              slug: { type: 'keyword' },
              images: { type: 'keyword' },
              tags: { type: 'keyword' },
            },
          },
          settings: {
            analysis: {
              analyzer: {
                fuzzy_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'fuzzy_filter'],
                },
              },
              filter: {
                fuzzy_filter: {
                  type: 'ngram',
                  min_gram: 2,
                  max_gram: 3,
                },
              },
            },
          },
        },
      });
      console.log('✅ Created products index');
    }
  } catch (error: any) {
    console.warn('⚠️  Elasticsearch connection failed:', error.message);
    console.warn('⚠️  Continuing without Elasticsearch. Search features will be limited.');
    console.warn('⚠️  To start Elasticsearch: docker-compose up -d elasticsearch');
    client = null; // Set to null so we know it's not available
  }
};

