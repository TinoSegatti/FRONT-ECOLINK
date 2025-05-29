"use client";

import React from 'react';

interface ActionButtonsProps {
    onRegistrarClick: () => void;
    onLimpiarClick: () => void;
}

export default function ActionButtons({ onRegistrarClick, onLimpiarClick }: ActionButtonsProps) {
    return (
        <div className="d-flex justify-content-between mb-3">
        <button
            className="btn btn-success"
            onClick={onRegistrarClick}
            aria-label="Registrar un nuevo cliente"
        >
            Registrar Cliente
        </button>
        <button
            className="btn btn-secondary"
            onClick={onLimpiarClick}
            aria-label="Limpiar todos los filtros"
        >
            Limpiar Todo
        </button>
        </div>
    );
}