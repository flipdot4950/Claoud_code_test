import Head from 'next/head';
import ChatContainer from '../components/Chat/ChatContainer';

export default function Home() {
  return (
    <>
      <Head>
        <title>n8n Workflow Generator - Powered by Claude AI</title>
        <meta name="description" content="Create n8n workflows using natural language" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatContainer />
    </>
  );
}
