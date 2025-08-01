import ProjectDetails from './ProjectDetails';

type Params = {
    id: string;
};

export default function ProjectDetailPage({ params }: { params: Params }) {
    // Simplificar: dejar que el componente cliente maneje la autenticación
    return (
        <ProjectDetails 
            projectId={params.id} 
            userEmail={''} 
        />
    );
}
