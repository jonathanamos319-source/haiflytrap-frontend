import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plus, Edit2, Trash2, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { BlogPost } from '@/types';
import api from '@/lib/api';

export function AdminBlogPage() {
  const { blogs, addBlog, updateBlog, deleteBlog, isLoadingBlogs } = useStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    image_url: ''
  });

  const handleStartCreate = () => {
    setFormData({ title: '', content: '', image_url: '' });
    setIsCreating(true);
    setIsEditing(null);
  };

  const handleStartEdit = (blog: BlogPost) => {
    setFormData(blog);
    setIsEditing(blog.id);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(null);
    setFormData({ title: '', content: '', image_url: '' });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert("Title and content are required.");
      return;
    }

    if (isCreating) {
      await addBlog(formData as any);
    } else if (isEditing) {
      await updateBlog(isEditing, formData);
    }

    handleCancel();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      await deleteBlog(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.post('/admin/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setFormData(prev => ({ ...prev, image_url: res.data.data.url }));
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingBlogs) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-surface-high rounded-xl w-48 animate-pulse"></div>
          <div className="h-10 bg-surface-high rounded-xl w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden">
          <div className="bg-surface-high h-12 w-full animate-pulse"></div>
          <div className="divide-y divide-outline-variant">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-high rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-high rounded w-32"></div>
                    <div className="h-3 bg-surface-high rounded w-20"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-surface-high rounded-lg"></div>
                  <div className="w-8 h-8 bg-surface-high rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-forest">Manage Blog Posts</h2>
        {!isCreating && !isEditing && (
          <button 
            onClick={handleStartCreate}
            className="bg-forest text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-forest/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        )}
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-forest mb-6">{isCreating ? 'Create New Post' : 'Edit Post'}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                className="w-full px-4 py-2 border border-outline-variant rounded-xl focus:outline-none focus:border-forest"
                placeholder="Post title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-forest mb-1">Image</label>
              <div className="flex items-center gap-4">
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />
                )}
                <label className="cursor-pointer bg-surface-high text-forest px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-surface-high/80 transition-colors">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest mb-1">Content</label>
              <textarea 
                value={formData.content} 
                onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                className="w-full px-4 py-2 border border-outline-variant rounded-xl focus:outline-none focus:border-forest min-h-[200px]"
                placeholder="Post content..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
              <button 
                onClick={handleCancel}
                className="px-6 py-2 rounded-xl border border-outline-variant text-forest hover:bg-surface-high transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-forest text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-forest/90 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-high text-forest font-medium text-sm">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No blog posts found. Create your first post!
                </td>
              </tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog.id} className="hover:bg-surface-high/30 transition-colors">
                  <td className="px-6 py-4">
                    <img 
                      src={blog.image_url || 'https://via.placeholder.com/150'} 
                      alt={blog.title} 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-forest line-clamp-1">{blog.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleStartEdit(blog)}
                        className="p-2 text-forest hover:bg-forest/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
