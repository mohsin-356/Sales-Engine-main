const fetcher = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export default fetcher;
