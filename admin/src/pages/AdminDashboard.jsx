import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isDummyClient } from '../supabase';
import axios from 'axios';
import { generateInvoicePDF } from '../utils/invoice';
import { LayoutDashboard, DollarSign, ShoppingBag, Users, FileImage, Upload, Plus, CheckCircle2, AlertCircle, Edit, Trash2, X, Clock, Check, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { adminToken } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [ordersSubTab, setOrdersSubTab] = useState('pending');

  // Upload design form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [secondaryPreviewFile, setSecondaryPreviewFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hooks, setHooks] = useState('');
  const [cards, setCards] = useState('');
  const [box, setBox] = useState('');
  const [reed, setReed] = useState('');
  const [formats, setFormats] = useState('DST, PES, EXP, XXX');

  // Categories list
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Edit category states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');

  // Manage designs list
  const [designs, setDesigns] = useState([]);
  const [editingDesign, setEditingDesign] = useState(null);
  const [downloadsList, setDownloadsList] = useState([]);

  // Edit design form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editPreviewFile, setEditPreviewFile] = useState(null);
  const [editSecondaryPreviewFile, setEditSecondaryPreviewFile] = useState(null);
  const [editSecondaryImageUrl, setEditSecondaryImageUrl] = useState(null);
  const [removeSecondaryImage, setRemoveSecondaryImage] = useState(false);
  const [editZipFile, setEditZipFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editHooks, setEditHooks] = useState('');
  const [editCards, setEditCards] = useState('');
  const [editBox, setEditBox] = useState('');
  const [editReed, setEditReed] = useState('');
  const [editFormats, setEditFormats] = useState('');

  const filteredOrders = stats?.recentOrders?.filter((order) => {
    if (ordersSubTab === 'pending') return order.status === 'pending';
    if (ordersSubTab === 'approved') return order.status === 'success';
    return order.status === 'failed'; // rejected
  }) || [];

  const fetchStatsAndCategories = async () => {
    setLoading(true);
    try {
      // 1. Fetch analytical stats from Express backend
      const statsRes = await axios.get('/api/admin/dashboard-stats', {
        headers: { 'x-admin-token': adminToken }
      });
      setStats(statsRes.data.stats);

      // 2. Fetch categories from Supabase
      if (isDummyClient) {
        setCategories([
          { id: 'c1', name: 'Border', description: 'Saree borders' },
          { id: 'c2', name: 'Blouse', description: 'Bridal blouse motifs' },
          { id: 'c3', name: 'Motif', description: 'Small motifs' }
        ]);
      } else {
        const { data: dbCats, error: catErr } = await supabase.from('categories').select('*');
        if (catErr) throw catErr;
        setCategories(dbCats || []);
      }

      // 3. Fetch designs from Supabase
      if (isDummyClient) {
        setDesigns([
          {
            id: '1',
            title: 'Traditional Gold Zari Butti Motif',
            description: 'Royal gold embroidery design for general sarees.',
            price: 299,
            is_featured: true,
            preview_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
            secondary_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=150&q=80',
            zip_file_path: 'original-files/mock_zip_1.zip',
            categories: { name: 'Motif' }
          }
        ]);
      } else {
        let { data: dbDesigns, error: designsErr } = await supabase
          .from('designs')
          .select(`
            id,
            title,
            description,
            price,
            is_featured,
            preview_image_url,
            secondary_image_url,
            zip_file_path,
            category_id,
            hooks,
            cards,
            box,
            reed,
            formats,
            categories (name)
          `)
          .order('created_at', { ascending: false });

        // Fallback for databases where secondary_image_url column has not been added yet
        if (designsErr && (designsErr.message?.includes('secondary_image_url') || designsErr.code === 'PGRST204' || designsErr.code === '42703')) {
          const fallbackRes = await supabase
            .from('designs')
            .select(`
              id,
              title,
              description,
              price,
              is_featured,
              preview_image_url,
              zip_file_path,
              category_id,
              hooks,
              cards,
              box,
              reed,
              formats,
              categories (name)
            `)
            .order('created_at', { ascending: false });

          dbDesigns = fallbackRes.data;
          designsErr = fallbackRes.error;
        }

        if (designsErr) throw designsErr;
        setDesigns(dbDesigns || []);
      }

      // 4. Fetch downloads list from Supabase
      if (isDummyClient) {
        setDownloadsList([
          { id: '1', customer_email: 'rohan@example.com', download_count: 3, last_download: new Date().toISOString(), design_id: 'd1', designs: { title: 'Gold Zari Butti Motif' } },
          { id: '2', customer_email: 'neha@example.com', download_count: 1, last_download: new Date().toISOString(), design_id: 'd2', designs: { title: 'Traditional Rose Border' } }
        ]);
      } else {
        const { data: dbDownloads, error: downloadsErr } = await supabase
          .from('downloads')
          .select(`
            id,
            customer_email,
            download_count,
            last_download,
            design_id,
            designs (title)
          `)
          .order('last_download', { ascending: false });

        if (!downloadsErr && dbDownloads) {
          setDownloadsList(dbDownloads);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      let serverMsg = 'Unknown error';
      if (err.response?.data) {
        const errData = err.response.data;
        if (typeof errData.error === 'object' && errData.error !== null) {
          serverMsg = errData.error.message || JSON.stringify(errData.error);
        } else if (typeof errData.error === 'string') {
          serverMsg = errData.error;
        } else if (typeof errData === 'string') {
          serverMsg = errData;
        } else {
          serverMsg = JSON.stringify(errData);
        }
      } else {
        serverMsg = err.message || 'Unknown error';
      }
      setError(`Failed to fetch dashboard data: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchStatsAndCategories();
    }
  }, [adminToken]);



  const handleDownloadInvoice = (order) => {
    const matchedDesign = designs.find((d) => d.id === order.design_id);
    const item = {
      title: order.title,
      category: matchedDesign?.categories?.name || 'Weaving',
      hooks: matchedDesign?.hooks || '',
      cards: matchedDesign?.cards || '',
      reed: matchedDesign?.reed || '',
      box: matchedDesign?.box || ''
    };
    generateInvoicePDF(item, order.email, order.payment_id, order.order_id, order.amount, order.created_at);
  };

  // Create Category Handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    setError('');
    setSuccess('');

    try {
      if (isDummyClient) {
        const newCat = { id: `c_mock_${Date.now()}`, name: newCategoryName, description: newCategoryDesc };
        setCategories([...categories, newCat]);
        setSuccess(`Category "${newCategoryName}" created (Sandbox).`);
        setNewCategoryName('');
        setNewCategoryDesc('');
        return;
      }

      const { data, error: insertErr } = await supabase
        .from('categories')
        .insert({ name: newCategoryName, description: newCategoryDesc })
        .select()
        .single();

      if (insertErr) throw insertErr;

      setCategories([...categories, data]);
      setSuccess(`Category "${newCategoryName}" created successfully!`);
      setNewCategoryName('');
      setNewCategoryDesc('');
    } catch (err) {
      setError(err.message || 'Failed to create category.');
    }
  };

  // Update Category Handler
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName) return;
    setError('');
    setSuccess('');

    try {
      if (isDummyClient) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: editCategoryName, description: editCategoryDesc } : c));
        setSuccess(`Category updated to "${editCategoryName}" (Sandbox).`);
        setEditingCategory(null);
        setEditCategoryName('');
        setEditCategoryDesc('');
        return;
      }

      const { data, error: updateErr } = await supabase
        .from('categories')
        .update({ name: editCategoryName, description: editCategoryDesc })
        .eq('id', editingCategory.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      setCategories(categories.map(c => c.id === editingCategory.id ? data : c));
      setSuccess(`Category "${editCategoryName}" updated successfully!`);
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryDesc('');
    } catch (err) {
      setError(err.message || 'Failed to update category.');
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (catId, catName) => {
    if (window.confirm(`Are you sure you want to delete the category "${catName}"? This may affect designs linked to it.`)) {
      setError('');
      setSuccess('');
      try {
        if (isDummyClient) {
          setCategories(categories.filter(c => c.id !== catId));
          setSuccess(`Category "${catName}" deleted (Sandbox).`);
          if (editingCategory?.id === catId) {
            setEditingCategory(null);
            setEditCategoryName('');
            setEditCategoryDesc('');
          }
          return;
        }

        const { error: deleteErr } = await supabase
          .from('categories')
          .delete()
          .eq('id', catId);

        if (deleteErr) {
          if (deleteErr.code === '23503') {
            throw new Error(`Cannot delete category "${catName}" because it is currently linked to design assets. Please reassign those designs first.`);
          }
          throw deleteErr;
        }

        setCategories(categories.filter(c => c.id !== catId));
        setSuccess(`Category "${catName}" deleted successfully!`);
        if (editingCategory?.id === catId) {
          setEditingCategory(null);
          setEditCategoryName('');
          setEditCategoryDesc('');
        }
      } catch (err) {
        setError(err.message || 'Failed to delete category.');
      }
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategoryDesc(cat.description || '');
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryDesc('');
  };

  // Upload Design Form Handler
  const handleUploadDesign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !price || !category || (!isDummyClient && (!previewFile || !zipFile))) {
      setError('Please fill all mandatory fields (Title, Category, Price, Primary Image 1, and ZIP file).');
      return;
    }

    setUploading(true);

    try {
      let previewUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
      let secondaryUrl = secondaryPreviewFile ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' : null;
      let zipPath = 'original-files/mock_design_file.zip';

      if (!isDummyClient) {
        const designId = crypto.randomUUID();

        // 1. Upload mandatory preview image (Image 1) to public previews bucket
        const previewExt = previewFile.name.split('.').pop();
        const previewFilePath = `${designId}_1.${previewExt}`;
        const { error: previewUploadErr } = await supabase.storage
          .from('previews')
          .upload(previewFilePath, previewFile);

        if (previewUploadErr) throw previewUploadErr;

        // Resolve public URL for primary preview image
        const { data: publicUrlData } = supabase.storage
          .from('previews')
          .getPublicUrl(previewFilePath);

        previewUrl = publicUrlData.publicUrl;

        // 2. Upload optional secondary preview image (Image 2) if provided
        if (secondaryPreviewFile) {
          const secExt = secondaryPreviewFile.name.split('.').pop();
          const secFilePath = `${designId}_2.${secExt}`;
          const { error: secUploadErr } = await supabase.storage
            .from('previews')
            .upload(secFilePath, secondaryPreviewFile);

          if (secUploadErr) throw secUploadErr;

          const { data: secPublicUrlData } = supabase.storage
            .from('previews')
            .getPublicUrl(secFilePath);

          secondaryUrl = secPublicUrlData.publicUrl;
        }

        // 3. Upload original ZIP to private original-files bucket
        const zipFilePath = `${designId}.zip`;
        const { error: zipUploadErr } = await supabase.storage
          .from('original-files')
          .upload(zipFilePath, zipFile);

        if (zipUploadErr) throw zipUploadErr;
        zipPath = `original-files/${zipFilePath}`;

        // 4. Resolve category ID
        const selectedCat = categories.find(c => c.name === category);
        if (!selectedCat) throw new Error('Invalid category chosen.');

        // 5. Save design row in database table
        const { error: dbErr } = await supabase
          .from('designs')
          .insert({
            id: designId,
            title,
            description,
            category_id: selectedCat.id,
            price: parseFloat(price),
            preview_image_url: previewUrl,
            secondary_image_url: secondaryUrl,
            zip_file_path: zipPath,
            is_featured: isFeatured,
            hooks: hooks || null,
            cards: cards || null,
            box: box || null,
            reed: reed || null,
            formats: formats || null
          });

        if (dbErr) throw dbErr;
      }

      setSuccess(`Weaving Design "${title}" uploaded successfully with ${secondaryUrl ? '2' : '1'} preview image(s)!`);
      // Reset inputs
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setIsFeatured(false);
      setPreviewFile(null);
      setSecondaryPreviewFile(null);
      setZipFile(null);
      setHooks('');
      setCards('');
      setBox('');
      setReed('');
      setFormats('DST, PES, EXP, XXX');

      // Refresh stats & list
      fetchStatsAndCategories();

    } catch (err) {
      console.error('Upload failed:', err);
      if (err.message?.includes('secondary_image_url') || err.code === 'PGRST204' || err.code === '42703') {
        setError('Database schema update required: Please run "ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS secondary_image_url TEXT;" in your Supabase SQL Editor.');
      } else {
        setError(err.message || 'Failed to complete design asset upload.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Open Edit Dialog
  const startEdit = (design) => {
    setEditingDesign(design);
    setEditTitle(design.title);
    setEditDescription(design.description || '');
    setEditPrice(design.price.toString());
    setEditCategory(design.categories?.name || '');
    setEditIsFeatured(design.is_featured);
    setEditPreviewFile(null);
    setEditSecondaryPreviewFile(null);
    setEditSecondaryImageUrl(design.secondary_image_url || null);
    setRemoveSecondaryImage(false);
    setEditZipFile(null);
    setEditHooks(design.hooks || '');
    setEditCards(design.cards || '');
    setEditBox(design.box || '');
    setEditReed(design.reed || '');
    setEditFormats(design.formats || '');
  };

  // Close Edit Dialog
  const cancelEdit = () => {
    setEditingDesign(null);
    setEditTitle('');
    setEditDescription('');
    setEditPrice('');
    setEditCategory('');
    setEditIsFeatured(false);
    setEditPreviewFile(null);
    setEditSecondaryPreviewFile(null);
    setEditSecondaryImageUrl(null);
    setRemoveSecondaryImage(false);
    setEditZipFile(null);
    setEditHooks('');
    setEditCards('');
    setEditBox('');
    setEditReed('');
    setEditFormats('');
  };

  // Save/Update Design Handler
  const handleUpdateDesign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      let previewUrl = editingDesign.preview_image_url;
      let secondaryUrl = removeSecondaryImage ? null : (editSecondaryImageUrl || editingDesign.secondary_image_url || null);
      let zipPath = editingDesign.zip_file_path;

      if (!isDummyClient) {
        const designId = editingDesign.id;

        // 1. Upload new Image 1 if provided
        if (editPreviewFile) {
          const previewExt = editPreviewFile.name.split('.').pop();
          const previewFilePath = `${designId}_1_${Date.now()}.${previewExt}`;
          const { error: previewUploadErr } = await supabase.storage
            .from('previews')
            .upload(previewFilePath, editPreviewFile);

          if (previewUploadErr) throw previewUploadErr;

          const { data: publicUrlData } = supabase.storage
            .from('previews')
            .getPublicUrl(previewFilePath);

          previewUrl = publicUrlData.publicUrl;
        }

        // 2. Upload new Image 2 if provided
        if (editSecondaryPreviewFile && !removeSecondaryImage) {
          const secExt = editSecondaryPreviewFile.name.split('.').pop();
          const secFilePath = `${designId}_2_${Date.now()}.${secExt}`;
          const { error: secUploadErr } = await supabase.storage
            .from('previews')
            .upload(secFilePath, editSecondaryPreviewFile);

          if (secUploadErr) throw secUploadErr;

          const { data: secPublicUrlData } = supabase.storage
            .from('previews')
            .getPublicUrl(secFilePath);

          secondaryUrl = secPublicUrlData.publicUrl;
        }

        // 3. Upload new ZIP if provided
        if (editZipFile) {
          const zipFilePath = `${designId}_${Date.now()}.zip`;
          const { error: zipUploadErr } = await supabase.storage
            .from('original-files')
            .upload(zipFilePath, editZipFile);

          if (zipUploadErr) throw zipUploadErr;
          zipPath = `original-files/${zipFilePath}`;
        }

        // 4. Resolve Category ID
        const selectedCat = categories.find(c => c.name === editCategory);
        if (!selectedCat) throw new Error('Invalid category chosen.');

        // 5. Update row in Supabase designs table
        const { error: dbErr } = await supabase
          .from('designs')
          .update({
            title: editTitle,
            description: editDescription,
            category_id: selectedCat.id,
            price: parseFloat(editPrice),
            preview_image_url: previewUrl,
            secondary_image_url: secondaryUrl,
            zip_file_path: zipPath,
            is_featured: editIsFeatured,
            hooks: editHooks || null,
            cards: editCards || null,
            box: editBox || null,
            reed: editReed || null,
            formats: editFormats || null
          })
          .eq('id', designId);

        if (dbErr) throw dbErr;
      } else {
        // Mock Sandbox Update
        const updated = designs.map(d => {
          if (d.id === editingDesign.id) {
            return {
              ...d,
              title: editTitle,
              description: editDescription,
              price: parseFloat(editPrice),
              categories: { name: editCategory },
              is_featured: editIsFeatured,
              preview_image_url: previewUrl,
              secondary_image_url: secondaryUrl
            };
          }
          return d;
        });
        setDesigns(updated);
      }

      setSuccess(`Design "${editTitle}" updated successfully!`);
      cancelEdit();
      fetchStatsAndCategories();

    } catch (err) {
      console.error('Update failed:', err);
      if (err.message?.includes('secondary_image_url') || err.code === 'PGRST204' || err.code === '42703') {
        setError('Database schema update required: Please run "ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS secondary_image_url TEXT;" in your Supabase SQL Editor.');
      } else {
        setError(err.message || 'Failed to update design.');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Delete Design Handler
  const handleDeleteDesign = async (designId, designTitle, previewUrl, zipPath) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${designTitle}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      if (!isDummyClient) {
        // 1. Delete row from designs table
        const { error: dbErr } = await supabase
          .from('designs')
          .delete()
          .eq('id', designId);

        if (dbErr) throw dbErr;

        // 2. Delete storage preview image (optional cleanup)
        try {
          if (previewUrl && previewUrl.includes('previews/')) {
            const previewFilename = previewUrl.split('previews/').pop();
            await supabase.storage.from('previews').remove([previewFilename]);
          }
        } catch (storageErr) {
          console.error('Failed to clean preview storage file:', storageErr);
        }

        // 3. Delete storage zip file (optional cleanup)
        try {
          if (zipPath && zipPath.startsWith('original-files/')) {
            const zipFilename = zipPath.replace('original-files/', '');
            await supabase.storage.from('original-files').remove([zipFilename]);
          }
        } catch (storageErr) {
          console.error('Failed to clean zip storage file:', storageErr);
        }
      } else {
        // Sandbox Mock Delete
        setDesigns(designs.filter(d => d.id !== designId));
      }

      setSuccess(`Design "${designTitle}" deleted successfully.`);
      fetchStatsAndCategories();

    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete design.');
    }
  };

  // Approve pending UPI order
  const handleApproveOrder = async (orderId, customerEmail, title) => {
    if (!window.confirm(`Are you sure you want to approve this order? This will grant the customer access to download the design.`)) {
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (isDummyClient) {
        // Sandbox Mock Update
        const updatedOrders = stats.recentOrders.map(o => o.id === orderId ? { ...o, status: 'success' } : o);
        setStats({
          ...stats,
          recentOrders: updatedOrders,
          totalRevenue: stats.totalRevenue + (stats.recentOrders.find(o => o.id === orderId)?.amount || 0),
          totalOrders: stats.totalOrders + 1
        });
        setSuccess('Order approved successfully (Sandbox).');
        return;
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ payment_status: 'success' })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setSuccess(`Order approved successfully! Access granted to ${customerEmail}.`);
      fetchStatsAndCategories();

    } catch (err) {
      console.error('Failed to approve order:', err);
      setError(err.message || 'Failed to approve order.');
    }
  };

  // Reject pending UPI order
  const handleRejectOrder = async (orderId, customerEmail) => {
    if (!window.confirm(`Are you sure you want to reject this order? The customer will not be able to download the design.`)) {
      return;
    }
    setError('');
    setSuccess('');

    try {
      if (isDummyClient) {
        // Sandbox Mock Update
        const updatedOrders = stats.recentOrders.map(o => o.id === orderId ? { ...o, status: 'failed' } : o);
        setStats({
          ...stats,
          recentOrders: updatedOrders
        });
        setSuccess('Order rejected (Sandbox).');
        return;
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setSuccess(`Order payment verification marked as failed.`);
      fetchStatsAndCategories();

    } catch (err) {
      console.error('Failed to reject order:', err);
      setError(err.message || 'Failed to reject order.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">

      {/* Featured Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 dark:from-brand-950 dark:to-dark-950 p-8 sm:p-10 text-white shadow-lg border border-slate-200/10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-brand-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-450 animate-pulse"></span>
            <span>Admin Portal Operations</span>
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl leading-tight">
            Weaving Management Center
          </h1>
          <p className="text-slate-355 mt-2 text-sm leading-relaxed">
            Monitor revenue stats, process customer pending UPI payment approvals, and configure weaving assets.
          </p>
        </div>
        {/* Decorative background accent */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 hidden md:block">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-400 via-teal-900 to-transparent rounded-full transform scale-150 translate-x-1/4 translate-y-1/4"></div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-500/20 text-sm">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="bg-brand-500/10 text-brand-600 dark:text-brand-400 p-3 rounded-xl"><DollarSign size={24} /></div>
            <div>
              <span className="text-slate-400 text-xs block font-semibold uppercase tracking-wider">Total Revenue</span>
              <strong className="text-slate-800 dark:text-slate-100 text-xl font-display font-bold">₹{stats.totalRevenue.toLocaleString()}</strong>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab('orders'); setOrdersSubTab('approved'); }}
            className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full focus:outline-none"
          >
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl"><ShoppingBag size={24} /></div>
            <div>
              <span className="text-slate-400 text-xs block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Orders</span>
              <strong className="text-slate-800 dark:text-slate-100 text-xl font-display font-bold">{stats.totalOrders}</strong>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left w-full focus:outline-none"
          >
            <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl"><Users size={24} /></div>
            <div>
              <span className="text-slate-400 text-xs block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Downloaded Mails</span>
              <strong className="text-slate-800 dark:text-slate-100 text-xl font-display font-bold">{stats.totalDownloadedEmails || 0}</strong>
            </div>
          </button>
          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-xl"><FileImage size={24} /></div>
            <div>
              <span className="text-slate-400 text-xs block font-semibold uppercase tracking-wider">Weaving Catalog</span>
              <strong className="text-slate-800 dark:text-slate-100 text-xl font-display font-bold">{stats.totalDesigns}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/60 dark:border-slate-800/50 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'overview'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
            : 'bg-slate-100 dark:bg-dark-900 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
            }`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'upload'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
            : 'bg-slate-100 dark:bg-dark-900 text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
            }`}
        >
          Upload & Categories
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'orders'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
            : 'bg-slate-100 dark:bg-dark-900 text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
            }`}
        >
          Customer Orders & UPI Approvals
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'invoices'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
            : 'bg-slate-100 dark:bg-dark-900 text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
            }`}
        >
          Invoices Download Center
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'designs'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
            : 'bg-slate-100 dark:bg-dark-900 text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
            }`}
        >
          Manage Uploaded Designs
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'downloads'
            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
            : 'bg-slate-100 dark:bg-dark-900 text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
            }`}
        >
          Downloaded Mails Log
        </button>
      </div>

      {/* Conditional Active Content Sections */}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Graph Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">Monthly Revenue Graph (INR)</h3>
            {stats?.monthlyRevenue ? (
              <div className="flex items-end justify-between h-48 pt-4 pb-2 px-2 border-b border-slate-150 dark:border-slate-800">
                {stats.monthlyRevenue.map((data, i) => {
                  const maxVal = Math.max(...stats.monthlyRevenue.map(m => m.sales)) || 1;
                  const pct = (data.sales / maxVal) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 group flex-1">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-850 text-white dark:text-slate-200 text-[10px] py-1 px-1.5 rounded font-mono shadow absolute -translate-y-8 select-none border border-slate-800/10">
                        ₹{data.sales}
                      </span>
                      <div
                        style={{ height: `${Math.max(pct, 5)}%` }}
                        className="w-8 bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 rounded-t-md transition-all duration-500 cursor-pointer shadow-inner"
                      ></div>
                      <span className="text-xs text-slate-400 font-semibold">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">Loading graph metrics...</div>
            )}
          </div>

          {/* Top Products */}
          <div className="lg:col-span-1 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Top Selling Patterns</h3>
            {stats?.topSelling && stats.topSelling.length > 0 ? (
              <div className="space-y-3">
                {stats.topSelling.map((prod, idx) => (
                  <div key={prod.id} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 dark:hover:bg-dark-950 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                    <div className="min-w-0 pr-2">
                      <span className="text-xs text-slate-400 font-bold block">RANK {idx + 1}</span>
                      <strong className="text-slate-700 dark:text-slate-350 truncate block text-xs">{prod.title}</strong>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded font-bold">{prod.salesCount} sales</span>
                      <span className="block text-slate-500 text-xs font-semibold mt-0.5">₹{prod.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs">No orders recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Design Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Upload size={18} className="text-brand-500" />
              <span>Upload New Weaving Design</span>
            </h3>

            <form onSubmit={handleUploadDesign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Design Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    placeholder="Royal Peacocks Sleeve Panel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Price (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    placeholder="299"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Detailed specifications, machine speed targets, stitch sequence notes..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-5 pl-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-slate-350 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                    Featured (Best Seller)
                  </label>
                </div>
              </div>

              {/* Weaving Specifications */}
              <div className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Weaving Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hooks</label>
                    <input
                      type="text"
                      value={hooks}
                      onChange={(e) => setHooks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="e.g. 480 hooks"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Cards</label>
                    <input
                      type="text"
                      value={cards}
                      onChange={(e) => setCards(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="e.g. 960 cards"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Box / Boxes</label>
                    <input
                      type="text"
                      value={box}
                      onChange={(e) => setBox(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="e.g. 2 boxes"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reed</label>
                    <input
                      type="text"
                      value={reed}
                      onChange={(e) => setReed(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="e.g. 100 steel reed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Supported Formats</label>
                    <input
                      type="text"
                      value={formats}
                      onChange={(e) => setFormats(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="DST, PES, EXP, XXX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Image 1 (Mandatory) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPreviewFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                  />
                  {previewFile && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold truncate">
                      ✓ Selected: {previewFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Image 2 (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSecondaryPreviewFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                  />
                  {secondaryPreviewFile ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold truncate">
                      ✓ Selected: {secondaryPreviewFile.name}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1 italic">Slide scroll second image</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                    Original ZIP File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                  />
                  {zipFile && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold truncate">
                      ✓ Selected: {zipFile.name}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload Design Asset</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Add or Edit Category */}
          <div className="lg:col-span-1 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
            {editingCategory ? (
              <>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                  <Edit size={18} className="text-brand-500" />
                  <span>Edit Category</span>
                </h3>

                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="Kurti Sleeve"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</label>
                    <input
                      type="text"
                      value={editCategoryDesc}
                      onChange={(e) => setEditCategoryDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="Sleeve borders for ladies kurtis"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditCategory}
                      className="flex-1 bg-slate-150 hover:bg-slate-200 dark:bg-dark-850 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                  <Plus size={18} className="text-brand-500" />
                  <span>Add Category</span>
                </h3>

                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="Kurti Sleeve"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</label>
                    <input
                      type="text"
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="Sleeve borders for ladies kurtis"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-dark-950 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>
              </>
            )}

            {/* Registered Categories list */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Categories</label>
              <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                {categories.map((c) => (
                  <div key={c.id} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-dark-950 rounded text-slate-600 dark:text-slate-400 font-medium border border-transparent border-b-slate-100 dark:border-b-slate-800 last:border-0 group">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-slate-400 italic truncate max-w-[140px]">{c.description || 'No description'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditCategory(c)}
                        className="p-1 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShoppingBag size={18} className="text-brand-500" />
              <span>Customer Orders & UPI Payment Approvals</span>
            </h3>

            {/* Sub-tab Switcher */}
            <div className="flex gap-2 bg-slate-50 dark:bg-dark-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
              <button
                onClick={() => setOrdersSubTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ordersSubTab === 'pending'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Pending ({stats?.recentOrders?.filter(o => o.status === 'pending').length || 0})
              </button>
              <button
                onClick={() => setOrdersSubTab('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ordersSubTab === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Approved ({stats?.recentOrders?.filter(o => o.status === 'success').length || 0})
              </button>
              <button
                onClick={() => setOrdersSubTab('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ordersSubTab === 'rejected'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Rejected ({stats?.recentOrders?.filter(o => o.status === 'failed').length || 0})
              </button>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Order Date</th>
                    <th className="pb-3 pr-4">Customer Email</th>
                    <th className="pb-3 pr-4">Design Purchased</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">UPI UTR Ref</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-colors">
                      <td className="py-3 pr-4 text-xs text-slate-550 dark:text-slate-400">
                        {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">
                        {order.email}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                        {order.title}
                      </td>
                      <td className="py-3 pr-4 font-mono font-bold text-slate-600 dark:text-slate-350">
                        ₹{order.amount}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-brand-600 dark:text-brand-400 font-semibold">
                        {order.payment_id ? (
                          order.payment_id.startsWith('pay_mock_')
                            ? order.payment_id.split('_').slice(0, 3).join('_')
                            : order.payment_id.split('_')[0]
                        ) : (
                          <span className="text-slate-400 font-sans font-normal italic">No Ref</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        {order.status === 'success' ? (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">Approved</span>
                        ) : order.status === 'pending' ? (
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold animate-pulse">Pending Approval</span>
                        ) : (
                          <span className="bg-red-500/10 text-red-650 dark:text-red-400 px-2 py-0.5 rounded font-bold">Rejected</span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {order.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveOrder(order.id, order.email, order.title)}
                              className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow shadow-emerald-500/10"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.id, order.email)}
                              className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow shadow-red-500/10"
                            >
                              <XCircle size={12} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-right">
                            {order.status === 'success' && (
                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-dark-950 px-2.5 py-1 transition-colors cursor-pointer shadow-sm rounded-lg text-xs font-semibold"
                              >
                                <span>Invoice</span>
                              </button>
                            )}
                            <span className="text-slate-400 text-xs italic">{order.status === 'success' ? '' : 'Rejected'}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-450 dark:text-slate-400 italic">No {ordersSubTab} orders found.</p>
          )}
        </div>
      )}

      {activeTab === 'designs' && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          {editingDesign ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Edit size={18} className="text-brand-500" />
                    <span>Update Weaving Design</span>
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">Editing: {editingDesign.title}</p>
                </div>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Back to List
                </button>
              </div>

              <form onSubmit={handleUpdateDesign} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: General Information */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">General Information</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Design Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Price (INR)</label>
                      <input
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    ></textarea>
                  </div>

                  <div className="flex items-center pl-1">
                    <input
                      type="checkbox"
                      id="editIsFeatured"
                      checked={editIsFeatured}
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="editIsFeatured" className="ml-2 text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider cursor-pointer">
                      Featured (Best Seller)
                    </label>
                  </div>
                </div>

                {/* Right Column: Weaving Specifications & Asset Uploads */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Specifications & Assets</h4>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hooks</label>
                      <input
                        type="text"
                        value={editHooks}
                        onChange={(e) => setEditHooks(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        placeholder="e.g. 480"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Cards</label>
                      <input
                        type="text"
                        value={editCards}
                        onChange={(e) => setEditCards(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        placeholder="e.g. 960"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Boxs</label>
                      <input
                        type="text"
                        value={editBox}
                        onChange={(e) => setEditBox(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        placeholder="e.g. 2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reed</label>
                      <input
                        type="text"
                        value={editReed}
                        onChange={(e) => setEditReed(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Formats</label>
                      <input
                        type="text"
                        value={editFormats}
                        onChange={(e) => setEditFormats(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-100 dark:bg-dark-955 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        placeholder="DST, PES"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                        Replace Image 1 (Mandatory Primary)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditPreviewFile(e.target.files[0])}
                        className="w-full text-xs text-slate-450 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-500/10 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                        Replace / Add Image 2 (Optional Secondary)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setEditSecondaryPreviewFile(e.target.files[0]);
                          setRemoveSecondaryImage(false);
                        }}
                        className="w-full text-xs text-slate-450 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-500/10 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
                      />
                      {(editSecondaryImageUrl || editingDesign?.secondary_image_url) && (
                        <div className="flex items-center gap-2 mt-1">
                          <label className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-600 dark:text-red-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={removeSecondaryImage}
                              onChange={(e) => setRemoveSecondaryImage(e.target.checked)}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <span>Remove Image 2</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                        Replace Original ZIP File (Optional)
                      </label>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setEditZipFile(e.target.files[0])}
                        className="w-full text-xs text-slate-450 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-500/10 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Actions footer inside right column */}
                  <div className="flex gap-3 pt-3 justify-end border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                <FileImage size={18} className="text-brand-500" />
                <span>Manage Uploaded Designs</span>
              </h3>

              {designs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-4">Images</th>
                        <th className="pb-3 pr-4">Design Title</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Price</th>
                        <th className="pb-3 pr-4">Featured</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                      {designs.map((design) => (
                        <tr key={design.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-1.5">
                              <img
                                src={design.preview_image_url}
                                alt={`${design.title} primary`}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200/50 dark:border-slate-800"
                                title="Image 1 (Primary)"
                              />
                              {design.secondary_image_url ? (
                                <div className="relative">
                                  <img
                                    src={design.secondary_image_url}
                                    alt={`${design.title} secondary`}
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200/50 dark:border-slate-800"
                                    title="Image 2 (Secondary)"
                                  />
                                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    2
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium px-1 bg-slate-100 dark:bg-dark-950 rounded">
                                  1 img
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">
                            {design.title}
                          </td>
                          <td className="py-3 pr-4 text-xs text-slate-550 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-dark-850 px-2 py-0.5 rounded font-medium text-slate-550">
                              {design.categories?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-mono font-bold text-slate-600 dark:text-slate-355">
                            ₹{design.price}
                          </td>
                          <td className="py-3 pr-4 text-xs">
                            {design.is_featured ? (
                              <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded font-bold">Featured</span>
                            ) : (
                              <span className="text-slate-400">Standard</span>
                            )}
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => startEdit(design)}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteDesign(design.id, design.title, design.preview_image_url, design.zip_file_path)}
                              className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No designs have been uploaded to the catalog yet.</p>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <DollarSign size={18} className="text-brand-500" />
            <span>Invoices Download Center</span>
          </h3>

          {stats?.recentOrders?.filter(o => o.status === 'success').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Order Date</th>
                    <th className="pb-3 pr-4">Invoice No</th>
                    <th className="pb-3 pr-4">Customer Email</th>
                    <th className="pb-3 pr-4">Design Title</th>
                    <th className="pb-3 pr-4">Amount Paid</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  {stats.recentOrders
                    .filter((order) => order.status === 'success')
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-colors">
                        <td className="py-3 pr-4 text-xs text-slate-550 dark:text-slate-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                          INV-{order.payment_id ? order.payment_id.toUpperCase() : 'MOCK'}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">
                          {order.email}
                        </td>
                        <td className="py-3 pr-4 text-slate-650 dark:text-slate-400">
                          {order.title}
                        </td>
                        <td className="py-3 pr-4 font-mono font-bold text-slate-600 dark:text-slate-350">
                          ₹{order.amount}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 transition-colors cursor-pointer shadow-sm rounded-lg text-xs font-semibold"
                          >
                            <span>Download Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-450 dark:text-slate-400 italic">No approved orders/invoices available.</p>
          )}
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <Users size={18} className="text-brand-500" />
            <span>Downloaded Mails Log</span>
          </h3>

          {downloadsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Last Download Date</th>
                    <th className="pb-3 pr-4">Customer Email</th>
                    <th className="pb-3 pr-4">Design Title</th>
                    <th className="pb-3 text-right">Downloads Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  {downloadsList.map((download) => (
                    <tr key={download.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/20 transition-colors">
                      <td className="py-3 pr-4 text-xs text-slate-550 dark:text-slate-400">
                        {download.last_download ? (
                          <>
                            {new Date(download.last_download).toLocaleDateString()} {new Date(download.last_download).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </>
                        ) : (
                          <span className="text-slate-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">
                        {download.customer_email}
                      </td>
                      <td className="py-3 pr-4 text-slate-650 dark:text-slate-400">
                        {download.designs?.title || 'Deleted Design'}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-650 dark:text-slate-350 pr-4">
                        {download.download_count} times
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-455 dark:text-slate-400 italic">No downloaded emails logs found.</p>
          )}
        </div>
      )}


    </div>
  );
}
