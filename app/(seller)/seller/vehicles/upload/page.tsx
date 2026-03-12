"use client"
import React, { useState } from 'react';
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { dynamicData } from '@/settings';

const UploadVehiclePage = () => {
    // Set default values to match the first dropdown options
    const [type, setType] = useState(dynamicData.vehicle_types[0]);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [fuelType, setFuelType] = useState('Petrol');
    const [dailyRate, setDailyRate] = useState('');
    const [weeklyRate, setWeeklyRate] = useState('');
    const [monthlyRate, setMonthlyRate] = useState('');
    const [withDriver, setWithDriver] = useState(false);
    
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(files);
        }
    };

    const formHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (imageFiles.length !== 4) {
            alert("You must upload exactly 4 images.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please login first");

            const uploadedUrls: string[] = [];

            // 1. Upload images
            for (const file of imageFiles) {
                // Use timestamp + random to prevent filename collisions
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('vehicle-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('vehicle-images').getPublicUrl(filePath);
                uploadedUrls.push(data.publicUrl);
            }

            // 2. Insert into DB
            const { error } = await supabase
                .from('uploaded_rent_vehicles')
                .insert([{ 
                    type, 
                    make, 
                    model, 
                    year: parseInt(year), 
                    seller_id: user.id,
                    image_urls: uploadedUrls,
                    fuel_type: fuelType,
                    daily_rate: parseFloat(dailyRate),
                    weekly_rate: weeklyRate ? parseFloat(weeklyRate) : null,
                    monthly_rate: monthlyRate ? parseFloat(monthlyRate) : null,
                    with_driver: withDriver,
                }]);

            if (error) throw error;

            alert("Vehicle uploaded successfully!");
            router.push('/seller/dashboard');

        } catch (err: any) {
            alert(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: "20px", maxWidth: "600px" }}>
            <h1>Upload Vehicle (4 Images Required)</h1>
            <form onSubmit={formHandler} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                <label>Vehicle Type:</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required>
                    {dynamicData.vehicle_types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                <input type="text" placeholder="Make (e.g. Toyota)" onChange={(e) => setMake(e.target.value)} required />
                <input type="text" placeholder="Model (e.g. Premio)" onChange={(e) => setModel(e.target.value)} required />
                <input type="number" placeholder="Year" onChange={(e) => setYear(e.target.value)} required />
                
                <label>Fuel Type:</label>
                <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} required>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                </select>

                <input type="number" placeholder="Daily Rate (Rs.)" onChange={(e) => setDailyRate(e.target.value)} required />
                <input type="number" placeholder="Weekly Rate (Optional)" onChange={(e) => setWeeklyRate(e.target.value)} />
                <input type="number" placeholder="Monthly Rate (Optional)" onChange={(e) => setMonthlyRate(e.target.value)} />
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label htmlFor="withDriver">Includes Driver?</label>
                    <input type="checkbox" id="withDriver" checked={withDriver} onChange={(e) => setWithDriver(e.target.checked)} />
                </div>

                <hr />
                <label>Select 4 Images:</label>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} required />
                <p style={{ color: imageFiles.length === 4 ? "green" : "red" }}>
                    Selected: {imageFiles.length} / 4
                </p>

                <button type="submit" disabled={loading || imageFiles.length !== 4}>
                    {loading ? "Processing..." : "Upload Vehicle"}
                </button>
            </form>
        </div>
    )
}

export default UploadVehiclePage;