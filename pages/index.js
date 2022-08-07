import Head from "next/head";
import { useState } from "react";
import React, {useEffect} from "react";
import styles from "../styles/Home.module.css";
import { rainbowCursor } from "cursor-effects";
import { Moralis } from "moralis";

export default function Home() {
  const serverUrl = "https://z7mcuikh8v7q.usemoralis.com:2053/server";
  const appId = "HKdWSIg5pkn4Pe5F5GYCTSrnoR023I4wbJ3QPTR7";
  Moralis.start({ serverUrl, appId });
  const [token, setToken] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [addy, setAddy] = useState("");

  useEffect(() => {
    new rainbowCursor({length: 25, colors: ['red', 'blue'], size: 18});
  });

 async function mintButton(data,qry,ady) {
  const youRl = data.generation.image_path;
  const imgFile = new Moralis.File(qry, youRl);
  await imgFile.saveIPFS();
  let imghash = imgFile.hash();
  let metadata = {
    title: qry,
    image: "/ipfs/" + imghash 
  }
  const jsonFil = new Moralis.File("metadata.json", {base64: btoa(JSON.stringify(metadata))});
  await jsonFil.saveIPFS();
  let metahash = jsonFil.hash();
  console.log(metahash);

  let resp = await Moralis.Plugins.rarible.lazyMint({
    chain: 'mainnet',
    userAddress: ady,
    tokenType: 'ERC721',
    tokenUrl: '/ipfs/' + metahash,
    royaltiesAmount: 3,  
  })
  console.log(resp);
 }

  function getDalle2() {
    setError(false);
    setLoading(true);
    fetch(`/api/dalle2?k=${token}&q=${query}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      
      .then((res) => res.json())
      .then((data) => {
        setResults(data.result);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setError(true);
      });


  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create DALLE 2 App</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Create <span className={styles.titleColor}>NFT's</span> with <span className={styles.titleColor}>DALLE 2</span>
        </h1>
        <p className={styles.description}>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer Token"
          />{" "}
          &{" "}
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query"
          />{" "}
          <input
            id="addy"
            type="text"
            value={addy}
            onChange={(e) => setAddy(e.target.value)}
            placeholder="Address"
          />

          <button className={styles} onClick={getDalle2}>Get 4 Images</button>
        </p>{" "}
        {error ? (
          <div className={styles.error}>Something went wrong. .Try again</div>
        ) : (
          <></>
        )}{" "}
        {loading && <p>Loading...</p>}
        <div className={styles.grid}>
          {results.map((result) => {
            return (
              <div className={styles.card}>
                <img
                  className={styles.imgPreview}
                  src={result.generation.image_path}
                />
                <div onClick={mintButton(result.generation.image_path, query,addy)}>
                click to mint
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}