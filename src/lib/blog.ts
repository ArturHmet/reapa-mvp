import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "posts");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  keyword: string;
  category: string;
  ogImage: string;
  readingTime: string;
  content: string;
}

function toPost(fileName: string, fileContents: string): BlogPost {
  const slug = fileName.replace(/\.mdx$/, "");
  const { data, content } = matter(fileContents);
  const rt = readingTime(content);
  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    description: data.description ?? "",
    keyword: data.keyword ?? "",
    category: data.category ?? "education",
    ogImage: data.ogImage ?? "/og-default.jpg",
    readingTime: rt.text,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".mdx"));
  const posts = fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return toPost(fileName, fileContents);
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return toPost(`${slug}.mdx`, fileContents);
  } catch {
    return null;
  }
}
