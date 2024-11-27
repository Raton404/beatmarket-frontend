import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import axios from 'axios';

const Library = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/library', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPurchases(response.data);
            } catch (error) {
                console.error('Error al cargar biblioteca:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    const handleDownload = async (beatId, licenseId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/library/download/${beatId}/${licenseId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `beat-${beatId}.mp3`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar beat:', error);
            alert('Error al descargar el beat');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Cargando tu biblioteca...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Mi Biblioteca</h1>
            
            {purchases.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            No tienes beats comprados aún.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purchases.map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition">
                            <CardContent className="p-4">
                                {item.coverUrl && (
                                    <img 
                                        src={item.coverUrl}
                                        alt={item.beatTitle}
                                        className="w-full h-48 object-cover rounded-md mb-4"
                                    />
                                )}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">
                                        {item.beatTitle}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Licencia: {item.licenseName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Comprado: {new Date(item.purchaseDate).toLocaleDateString()}
                                    </p>
                                    <div className="pt-4">
                                        <Button
                                            onClick={() => handleDownload(item.beatId, item.licenseId)}
                                            className="w-full"
                                        >
                                            Descargar Beat
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;