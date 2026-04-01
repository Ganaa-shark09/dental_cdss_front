export type CdssSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'help'
  | 'contrast';

export function mapSeverity(
  severity?: CdssSeverity,
): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  switch (severity) {
    case 'primary':
      return 'info'; // map primary → info
    case 'help':
      return 'contrast'; // map help → contrast
    default:
      return severity ?? 'secondary';
  }
}
