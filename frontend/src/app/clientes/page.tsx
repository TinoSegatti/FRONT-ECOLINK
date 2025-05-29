import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import ClientesClient from "../../components/ClientesClient"

export default function ClientesPage() {
    return (
        <div className="min-vh-100" style={{ backgroundColor: "var(--background)" }}>
        {/* Header Section con la nueva paleta */}
        

        {/* Main Content Section */}
        <div className="container-fluid clientes-page-container">
            <div className="card-custom p-4">
            
            {/* Componente ClientesClient */}
            <ClientesClient />
            </div>
        </div>

        {/* Footer con nueva paleta */}
        <footer className="mt-5 py-4" style={{ backgroundColor: "var(--bg-dark-section)", color: "white" }}>
            <div className="container-fluid clientes-page-container">
            <div className="row">
                <div className="col-md-6">
                <h6 className="text-primary-green">ECOLINK</h6>
                <p className="mb-0 opacity-75">Sistema de gestión de clientes moderno y eficiente</p>
                </div>
                <div className="col-md-6 text-md-end">
                <small className="opacity-75">© 2024 ECOLINK. Todos los derechos reservados.</small>
                </div>
            </div>
            </div>
        </footer>
        </div>
    )
}
