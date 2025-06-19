import Head from "next/head";
import FileUpload from "../components/FileUpload";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sentiment Analyzer</title>
      </Head>
      <main className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-8">
          Upload a CSV to Analyze Sentiment
        </h1>
        <FileUpload />
      </main>
    </>
  );
}
