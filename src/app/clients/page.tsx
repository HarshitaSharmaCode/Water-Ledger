'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared/Layout';
import { ClientService } from '@/services/client.service';
import { ClientWithBalance } from '@/types/client.types';
import { Search, UserPlus, Phone, MapPin, ChevronRight, X, Users, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants';
import { useToastStore } from '@/store/toast.store';

export const Clients: React.FC = () => {
  const t = useTranslations('Clients');
  const tCommon = useTranslations('Common');
  const tToast = useTranslations('Toast');
  const router = useRouter();
  const { addToast } = useToastStore();

  const [clients, setClients] = useState<ClientWithBalance[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add client form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('500');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ClientWithBalance | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    const data = await ClientService.getAllClients();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) return setFormError(t('validationName'));
    if (!phone.trim() || phone.length < 10) return setFormError(t('validationPhone'));
    if (!address.trim()) return setFormError(t('validationAddress'));

    const priceNum = parseFloat(defaultPrice);
    if (isNaN(priceNum) || priceNum <= 0) return setFormError(t('validationPrice'));

    setFormSaving(true);
    try {
      await ClientService.createClient({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        default_price_per_tanker: priceNum,
      });
      setName(''); setPhone(''); setAddress(''); setDefaultPrice('500');
      setIsModalOpen(false);
      addToast(tToast('clientCreated'), 'success');
      await fetchClients();
    } catch {
      setFormError(t('saveError'));
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ClientService.deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      addToast(tToast('clientDeleted'), 'success');
      await fetchClients();
    } catch {
      setDeleteTarget(null);
      addToast(t('deleteError'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => { setIsModalOpen(false); setFormError(null); };

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Page heading + CTA */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              className="text-xl font-bold leading-tight"
              style={{ color: '#0A1931' }}
            >
              {t('title')}
            </h2>
            <p
              className="text-xs font-bold mt-1 uppercase tracking-widest"
              style={{ color: '#4A7FA7' }}
            >
              {t('subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary shrink-0 text-xs py-2.5 px-4 gap-1.5 min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            {t('addNewClient')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
            style={{ color: '#4A7FA7' }}
          >
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-icon-left"
          />
        </div>

        {/* Client list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#1A3D63', borderTopColor: 'transparent' }}
            />
            <span className="text-xs font-medium" style={{ color: '#4A7FA7' }}>
              {tCommon('loading')}
            </span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center px-8"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D0E4F2',
              borderRadius: '16px',
            }}
          >
            <div
              className="flex items-center justify-center w-16 h-16 mb-4"
              style={{
                background: '#EEF5FB',
                borderRadius: '16px',
                color: '#B3CFE5',
              }}
            >
              <Users className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium" style={{ color: '#4A7FA7' }}>
              {t('noClients')}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #D0E4F2',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(10,25,49,0.06)',
            }}
          >
            {filteredClients.map((client, idx) => {
              const absBalance = Math.abs(client.pending_balance).toLocaleString('en-IN');
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between px-4 py-4 cursor-pointer transition-colors"
                  style={{
                    borderBottom: idx < filteredClients.length - 1 ? '1px solid #F6FAFD' : 'none',
                  }}
                  onClick={() => router.push(`${ROUTES.CLIENTS}/${client.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#F6FAFD';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: '#0A1931' }}
                    >
                      {client.name}
                    </span>
                    <div
                      className="flex flex-col gap-0.5 text-[10px] font-medium mt-0.5"
                      style={{ color: '#4A7FA7' }}
                    >
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-md">
                        <MapPin className="w-3 h-3" />
                        {client.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      {client.balance_type === 'pending' && (
                        <span className="badge-pending">₹{absBalance} Due</span>
                      )}
                      {client.balance_type === 'advance' && (
                        <span className="badge-advance">₹{absBalance} Adv</span>
                      )}
                      {client.balance_type === 'zero' && (
                        <span className="badge-zero">Clear</span>
                      )}
                      <span className="text-[9px] font-medium" style={{ color: '#4A7FA7' }}>
                        ₹{client.default_price_per_tanker}/tanker
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(client);
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer shrink-0"
                      style={{ color: '#B3CFE5', background: 'transparent' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2';
                        (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = '#B3CFE5';
                      }}
                      aria-label={`Delete ${client.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4" style={{ color: '#B3CFE5' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Client Drawer */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(10,25,49,0.55)' }}>
              <div
                className="absolute inset-0"
                onClick={closeModal}
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="relative w-full max-w-lg flex flex-col gap-5 z-10 max-h-[90vh] overflow-y-auto"
                style={{
                  background: '#FFFFFF',
                  borderTop: '1px solid #D0E4F2',
                  borderRadius: '24px 24px 0 0',
                  padding: '24px',
                  boxShadow: '0 -8px 32px rgba(10,25,49,0.18)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #0A1931, #4A7FA7, #B3CFE5)',
                    borderRadius: '24px 24px 0 0',
                  }}
                />

                <div
                  className="w-8 h-1 rounded-full mx-auto mt-1"
                  style={{ background: '#B3CFE5' }}
                />

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold" style={{ color: '#0A1931' }}>
                    {t('addClientTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors"
                    style={{ color: '#4A7FA7', background: '#EEF5FB' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#D0E4F2';
                      (e.currentTarget as HTMLButtonElement).style.color = '#0A1931';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#EEF5FB';
                      (e.currentTarget as HTMLButtonElement).style.color = '#4A7FA7';
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveClient} className="flex flex-col gap-4">
                  {formError && (
                    <div
                      className="px-4 py-3 rounded-xl text-xs font-semibold"
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#C0392B',
                      }}
                    >
                      {formError}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#1A3D63' }}
                    >
                      {t('nameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#1A3D63' }}
                    >
                      {t('phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="input"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#1A3D63' }}
                    >
                      {t('addressLabel')}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Shop No. 5, Sector 4 Market"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#1A3D63' }}
                    >
                      {t('defaultPriceLabel')}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="500"
                      value={defaultPrice}
                      onChange={(e) => setDefaultPrice(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div
                    className="flex gap-3 pt-2"
                    style={{ borderTop: '1px solid #EEF5FB' }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-secondary flex-1"
                    >
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formSaving}
                      className="btn btn-primary flex-1"
                    >
                      {formSaving ? tCommon('saving') : tCommon('save')}
                    </button>
                  </div>
                </form>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteTarget && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
              style={{ background: 'rgba(10,25,49,0.6)' }}
            >
              <div
                className="absolute inset-0"
                onClick={() => { if (!isDeleting) setDeleteTarget(null); }}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="relative w-full max-w-sm flex flex-col gap-5 z-10"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D0E4F2',
                  borderRadius: '20px',
                  padding: '28px 24px 24px',
                  boxShadow: '0 16px 48px rgba(10,25,49,0.28)',
                }}
              >
                {/* Top accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #EF4444, #F97316)',
                    borderRadius: '20px 20px 0 0',
                  }}
                />

                {/* Icon + title */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-2xl"
                    style={{ background: '#FEF2F2' }}
                  >
                    <AlertTriangle className="w-6 h-6" style={{ color: '#EF4444' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#0A1931' }}>
                      {t('deleteConfirmTitle')}
                    </h3>
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: '#4A7FA7' }}>
                      {t('deleteConfirmMessage').replace('{name}', deleteTarget.name)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                    className="btn btn-secondary flex-1"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="btn flex-1 font-semibold"
                    style={{
                      background: isDeleting ? '#FCA5A5' : '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDeleting ? `${tCommon('loading')}` : t('deleteConfirmBtn')}
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default Clients;