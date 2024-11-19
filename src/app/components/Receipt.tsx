"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Barcode } from "./Barcode";
import { redirect } from "next/navigation";
import { toPng } from "html-to-image";

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  location: string | null;
  public_gists: number;
}

async function getGitHubStats(username: string) {
  const headers: HeadersInit = process.env.GITHUB_ACCESS_TOKEN
    ? {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      }
    : {
        Accept: "application/vnd.github.v3+json",
      };

  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    }),
    fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    ),
  ]);

  if (!userResponse.ok) throw new Error("User not found");

  const userData = (await userResponse.json()) as GitHubUser;
  const reposData = (await reposResponse.json()) as GitHubRepo[];

  // Calculate repository stats
  const totalStars = reposData.reduce(
    (acc: number, repo) => acc + repo.stargazers_count,
    0
  );
  const totalForks = reposData.reduce(
    (acc: number, repo) => acc + repo.forks_count,
    0
  );

  // Calculate most active day
  const pushDays = reposData.map((repo) => new Date(repo.pushed_at).getDay());
  const dayCount = new Array(7).fill(0);
  pushDays.forEach((day) => dayCount[day]++);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const mostActiveDay = days[dayCount.indexOf(Math.max(...dayCount))];

  // Add served by name
  const FAMOUS_DEVS = [
    "Linus Torvalds",
    "Ada Lovelace",
    "Grace Hopper",
    "Alan Turing",
    "Margaret Hamilton",
    "Dennis Ritchie",
    "Ken Thompson",
  ];

  const serverName =
    FAMOUS_DEVS[Math.floor(Math.random() * FAMOUS_DEVS.length)];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateFilter = thirtyDaysAgo.toISOString().split("T")[0];

  const commitsResponse = await fetch(
    `https://api.github.com/search/commits?q=author:${username}+committer-date:>=${dateFilter}`,
    {
      headers: {
        ...headers,
        Accept: "application/vnd.github.cloak-preview+json",
      },
      next: { revalidate: 3600 },
    }
  );

  const commitsData = await commitsResponse.json();
  const totalCommits = commitsData.total_count;

  // Calculate top languages
  const languages = reposData.reduce((acc: { [key: string]: number }, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang)
    .join(", ");

  return {
    userData,
    stats: {
      totalRepos: reposData.length,
      totalStars,
      totalForks,
      mostActiveDay,
      totalCommits,
      serverName,
      topLanguages: topLanguages || "NONE",
    },
  };
}

export default function Receipt({ user }: { user: string }) {
  const [username, setUsername] = useState("");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [data, setData] = useState<any>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const filter = (node: HTMLElement) => {
      const exclusionClasses = ["exclude"];
      return !exclusionClasses.includes(node.className);
    };

    if (receiptRef.current) {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 0.95,
        filter: filter,
      });
      const link = document.createElement("a");
      link.download = `github-receipt-${data?.userData?.login || "user"}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  // const handleShare = async () => {
  //   if (!receiptRef.current) return;

  //   try {
  //     const dataUrl = await toPng(receiptRef.current, { filter });
  //     const blob = await (await fetch(dataUrl)).blob();
  //     const file = new File([blob], "github-receipt.png", {
  //       type: "image/png",
  //     });

  //     if (navigator.share) {
  //       await navigator.share({
  //         title: "My GitHub Receipt",
  //         text: `Check out my GitHub stats for ${data?.userData?.login}!`,
  //         files: [file],
  //       });
  //     } else {
  //       handleDownload();
  //     }
  //   } catch (error) {
  //     console.error("Error sharing:", error);
  //   }
  // };

  useEffect(() => {
    setUsername(user);
    // setLoading(true);
    // setError("");

    if (!username) return;

    // try {
    //   // const stats = await getGitHubStats(username);
    //   // setData(stats);
    //   getGitHubStats(username)
    //     .then((stats) => setData(stats))
    //     .catch((err) => notFound());
    // } catch (err) {
    //   setError("User not found");
    // } finally {
    //   setLoading(false);
    // }

    const fetchData = async () => {
      try {
        const stats = await getGitHubStats(username);
        setData(stats);
      } catch {
        // notFound();
        redirect("/");
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  return (
    <main className="animate-receipt-printing z-[999] drop-shadow-xl">
      {data && (
        <div
          className="flex flex-col items-center  relative p-4"
          ref={receiptRef}
        >
          <div className="receipt-container">
            <div>
              <Image
                src="/empty-receipt.png"
                width={461}
                height={990}
                alt="GitHub Receipt"
                className="absolute transform -translate-x-[45%] -translate-y-[57%] top-1/2 left-1/2 -z-10 scale-[2.3]"
              />
              <div className="receipt-content w-full text-black pr-4">
                <div className="font-mono text-2xl leading-6 tracking-wide">
                  <div className="text-center mb-6">
                    <h2 className="font-bold text-[3rem] ">GITHUB RECEIPT</h2>
                    {/* <p>
                      {new Date()
                        .toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                        .toUpperCase()}
                    </p> */}
                  </div>
                  <div className="mb-4">
                    {/* <p>CUSTOMER: {data.userData.name || data.userData.login}</p>
                    <p className="opacity-75">HANDLE: {data.userData.login}</p> */}
                    <p className="mt-1 opacity-75">
                      ORDER #
                      {String(Math.floor(Math.random() * 9999)).padStart(
                        4,
                        "0"
                      )}{" "}
                      for {data.userData.name || data.userData.login}
                    </p>
                    <p>
                      {new Date()
                        .toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                        .toUpperCase()}
                    </p>
                  </div>
                  <div className="mb-4 border-b border-dashed border-black">
                    <table className="w-full">
                      <thead className="border-y border-dashed border-black">
                        <tr>
                          <th className="text-left">QTY</th>
                          <th className="text-left">ITEM</th>
                          <th className="text-right">AMT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>01</td>
                          <td>REPOSITORIES</td>
                          <td className="text-right">
                            {data.stats.totalRepos}
                          </td>
                        </tr>
                        <tr>
                          <td>02</td>
                          <td>STARS EARNED</td>
                          <td className="text-right">
                            {data.stats.totalStars}
                          </td>
                        </tr>
                        <tr>
                          <td>03</td>
                          <td>REPO FORKS</td>
                          <td className="text-right">
                            {data.stats.totalForks}
                          </td>
                        </tr>
                        <tr>
                          <td>04</td>
                          <td>FOLLOWERS</td>
                          <td className="text-right">
                            {data.userData.followers}
                          </td>
                        </tr>
                        <tr>
                          <td>05</td>
                          <td>FOLLOWING</td>
                          <td className="text-right">
                            {data.userData.following}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mb-4">
                    <p>YOUR TECH STACK</p>
                    {/* <p>{data.stats.topLanguages || "NONE"}</p> */}
                    {data.stats.topLanguages.split(", ").map((lang: string) => (
                      <span
                        key={lang}
                        className="inline-block px-2 py-1 mr-2 bg-black text-white"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                  <div className="border-t border-dashed pt-3 mb-4 border-black">
                    <div className="flex justify-between">
                      <span>MOST ACTIVE DAY:</span>
                      <span className="font-bold">
                        {data.stats.mostActiveDay}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>COMMITS (30d):</span>
                      <span>{data.stats.totalCommits}</span>
                    </div>
                    {/* <div className="flex justify-between font-bold mt-2">
                      <span>CONTRIBUTION SCORE:</span>
                      <span>
                        {data.stats.totalStars * 2 +
                          data.userData.followers * 3}
                      </span>
                    </div> */}
                  </div>
                  <div className="text-center opacity-75 mb-4">
                    <p>Served by: {data.stats.serverName}</p>
                    <p>{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="border-t border-dashed pt-4 mb-4 text-center border-black">
                    <p>
                      COUPON CODE:{" "}
                      {Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </p>
                    <p className=" opacity-75">Save for your next commit!</p>
                  </div>
                  <div className="mb-6 opacity-75">
                    <p>CARD #: **** **** **** {new Date().getFullYear()}</p>
                    <p>AUTH CODE: {Math.floor(Math.random() * 1000000)}</p>
                    <p>CARDHOLDER: {data.userData.login.toUpperCase()}</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-4">THANK YOU FOR CODING!</p>
                    <p className="mb-4 opacity-75">
                      Member since{" "}
                      {new Date(data.userData.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}{" "}
                      ^_^
                    </p>
                    <Barcode value={`github.com/${data.userData.login}`} />
                    <p className=" opacity-75">
                      github.com/{data.userData.login}
                    </p>
                  </div>
                  <div className="exclude animate-label">
                    <button
                      className="exclude px-4 py-2 bg-black text-white text-md fixed bottom-4 right-4"
                      onClick={handleDownload}
                    >
                      Download Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
