import ToastNotification from './ToastNotification';

const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <ToastNotification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    show={notification.show}
                    onClose={() => onRemove(notification.id)}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
