import { get, set, del, keys, createStore } from "idb-keyval";

const STORE = createStore("card-workshop-db", "projects");

export type Project = {
  id: string;
  name: string;
  type: "board" | "cards" | "combined";
  createdAt: string;
  updatedAt: string;
  boardData?: string;
  boardSize?: number;
  cardsData?: string;
  cardBackData?: string;
};

export const projectStorage = {
  async getAll(): Promise<Project[]> {
    const allKeys = await keys<string>(STORE);
    const items = await Promise.all(allKeys.map((k) => get<Project>(k, STORE)));
    return (items.filter(Boolean) as Project[]).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async get(id: string): Promise<Project | undefined> {
    return get<Project>(id, STORE);
  },

  async save(project: Project): Promise<void> {
    await set(project.id, { ...project, updatedAt: new Date().toISOString() }, STORE);
  },

  async delete(id: string): Promise<void> {
    await del(id, STORE);
  },

  create(name: string, type: Project["type"]): Project {
    return {
      id: crypto.randomUUID(),
      name,
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /** 從目前 localStorage 快照建立專案存入 IndexedDB */
  async saveFromLocalStorage(name: string, type: Project["type"]): Promise<Project> {
    const project = this.create(name, type);
    if (type !== "cards") {
      project.boardData = localStorage.getItem("card-workshop-board") ?? undefined;
      const savedSize = localStorage.getItem("card-workshop-board-size");
      project.boardSize = savedSize ? Number(savedSize) : 40;
    }
    if (type !== "board") {
      project.cardsData = localStorage.getItem("card-workshop-suits") ?? undefined;
      project.cardBackData = localStorage.getItem("card-workshop-card-back") ?? undefined;
    }
    await this.save(project);
    return project;
  },

  /** 將專案數據載入到 localStorage（再重新整理頁面即可看到效果） */
  loadToLocalStorage(project: Project): void {
    if (project.boardData) localStorage.setItem("card-workshop-board", project.boardData);
    if (project.boardSize) localStorage.setItem("card-workshop-board-size", String(project.boardSize));
    if (project.cardsData) localStorage.setItem("card-workshop-suits", project.cardsData);
    if (project.cardBackData) localStorage.setItem("card-workshop-card-back", project.cardBackData);
  },
};
