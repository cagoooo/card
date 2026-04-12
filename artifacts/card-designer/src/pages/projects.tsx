import { useState, useEffect } from "react";
import { Plus, Trash2, FolderOpen, Copy, Pencil, LayoutDashboard, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { projectStorage, type Project } from "@/lib/project-storage";

const TYPE_LABELS: Record<Project["type"], string> = {
  board:    "🎲 圖板設計",
  cards:    "🃏 卡牌設計",
  combined: "🎯 圖板＋卡牌",
};

export default function Projects() {
  const [projects,      setProjects]      = useState<Project[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [newDialog,     setNewDialog]     = useState(false);
  const [newName,       setNewName]       = useState("");
  const [newType,       setNewType]       = useState<Project["type"]>("combined");
  const [renameDialog,  setRenameDialog]  = useState<Project | null>(null);
  const [renameName,    setRenameName]    = useState("");
  const [saving,        setSaving]        = useState(false);
  const [, navigate]                      = useLocation();

  const loadProjects = async () => {
    setLoading(true);
    setProjects(await projectStorage.getAll());
    setLoading(false);
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await projectStorage.saveFromLocalStorage(newName.trim(), newType);
    setSaving(false);
    setNewDialog(false);
    setNewName("");
    await loadProjects();
  };

  const handleLoad = async (p: Project) => {
    projectStorage.loadToLocalStorage(p);
    if      (p.type === "board")    navigate("/board");
    else if (p.type === "cards")    navigate("/cards");
    else                            navigate("/board");
  };

  const handleDuplicate = async (p: Project) => {
    const copy: Project = { ...p, id: crypto.randomUUID(), name: `${p.name} 副本`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await projectStorage.save(copy);
    await loadProjects();
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`確定要刪除「${p.name}」嗎？此操作無法復原。`)) return;
    await projectStorage.delete(p.id);
    await loadProjects();
  };

  const handleRename = async () => {
    if (!renameDialog || !renameName.trim()) return;
    await projectStorage.save({ ...renameDialog, name: renameName.trim() });
    setRenameDialog(null);
    await loadProjects();
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex-1 flex flex-col bg-secondary/10 min-h-0">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold">我的專案</h1>
          <p className="text-xs text-muted-foreground">儲存與管理你的卡牌工坊設計（使用瀏覽器 IndexedDB 儲存）</p>
        </div>
        <Input
          className="w-48 h-9"
          placeholder="🔍 搜尋專案…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setNewDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> 儲存目前設計
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">載入中…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {search ? "找不到符合的專案" : "尚無已儲存的專案，點擊「儲存目前設計」開始！"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
                {/* Icon + name */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {p.type === "board" ? <LayoutDashboard className="w-5 h-5 text-primary" /> : <Layers className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[p.type]}</p>
                  </div>
                </div>

                {/* Meta */}
                <p className="text-xs text-muted-foreground">最後更新：{fmt(p.updatedAt)}</p>

                {/* Actions */}
                <div className="flex gap-1.5 mt-auto">
                  <Button size="sm" className="flex-1 text-xs h-8" onClick={() => handleLoad(p)}>
                    <FolderOpen className="w-3.5 h-3.5 mr-1" /> 載入
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                    title="重新命名"
                    onClick={() => { setRenameDialog(p); setRenameName(p.name); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                    title="複製" onClick={() => handleDuplicate(p)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive"
                    title="刪除" onClick={() => handleDelete(p)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New project dialog */}
      <Dialog open={newDialog} onOpenChange={setNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">儲存目前設計</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">專案名稱</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例：三年級地理大富翁"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">儲存類型</label>
              <Select value={newType} onValueChange={(v) => setNewType(v as Project["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(TYPE_LABELS) as [Project["type"], string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              將把目前正在編輯的設計快照存入瀏覽器的 IndexedDB 資料庫。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || saving}>
              {saving ? "儲存中…" : "💾 儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!renameDialog} onOpenChange={(o) => { if (!o) setRenameDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">重新命名</DialogTitle></DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>取消</Button>
            <Button onClick={handleRename} disabled={!renameName.trim()}>儲存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
