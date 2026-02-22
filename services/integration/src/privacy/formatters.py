"""
Data Formatter
Formats exported data for different output formats
"""
from typing import Dict, Any, List
import json
import csv
import io


class DataFormatter:
    """
    Formats data for different export formats
    """
    
    def format_json(self, data: Dict[str, Any]) -> str:
        """
        Format data as JSON
        
        Args:
            data: Data to format
            
        Returns:
            JSON string
        """
        return json.dumps(data, indent=2, default=str)
    
    def format_csv(self, data: Dict[str, Any]) -> str:
        """
        Format data as CSV
        
        Args:
            data: Data to format
            
        Returns:
            CSV string
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Flatten nested data
        flattened = self._flatten_dict(data)
        
        # Write headers and rows
        writer.writerow(["Key", "Value"])
        for key, value in flattened.items():
            writer.writerow([key, str(value)])
        
        return output.getvalue()
    
    def _flatten_dict(self, data: Dict[str, Any], parent_key: str = "", sep: str = ".") -> Dict[str, Any]:
        """Flatten nested dictionary"""
        items = []
        
        for key, value in data.items():
            new_key = f"{parent_key}{sep}{key}" if parent_key else key
            
            if isinstance(value, dict):
                items.extend(self._flatten_dict(value, new_key, sep=sep).items())
            elif isinstance(value, list):
                # Convert list to comma-separated string
                items.append((new_key, ", ".join(str(v) for v in value)))
            else:
                items.append((new_key, value))
        
        return dict(items)
    
    def format_summary(self, data: Dict[str, Any], record_counts: Dict[str, int]) -> Dict[str, Any]:
        """
        Create a summary of exported data
        
        Args:
            data: Exported data
            record_counts: Count of records by type
            
        Returns:
            Summary dictionary
        """
        summary = {
            "data_types_exported": list(data.keys()),
            "total_data_types": len(data),
            "record_counts": record_counts,
            "total_records": sum(record_counts.values()),
            "data_size_kb": len(json.dumps(data)) / 1024
        }
        
        return summary
    
    def add_disclaimer(self, data: str, jurisdiction: str) -> str:
        """
        Add jurisdiction-specific disclaimer to data
        
        Args:
            data: Formatted data
            jurisdiction: Legal jurisdiction
            
        Returns:
            Data with disclaimer appended
        """
        disclaimers = {
            "GDPR": """
            
            ================================
            GDPR DATA EXPORT DISCLAIMER
            ================================
            This data export has been generated in accordance with Article 15 of the 
            General Data Protection Regulation (GDPR). You have the right to:
            - Access your personal data
            - Receive a copy of your personal data
            - Request correction of inaccurate data
            - Request deletion of your data (Article 17)
            - Restrict processing of your data
            - Object to processing of your data
            - Data portability
            
            This export contains all personal data we hold about you as of the export date.
            For questions or concerns, please contact our Data Protection Officer.
            ================================
            """,
            "CCPA": """
            
            ================================
            CCPA DATA EXPORT DISCLAIMER
            ================================
            This data export has been generated in accordance with the California Consumer 
            Privacy Act (CCPA). You have the right to:
            - Know what personal data is collected about you
            - Know whether your personal data is sold or disclosed
            - Say no to the sale of your personal data
            - Access your personal data
            - Request deletion of your personal data
            - Equal service and price
            
            This export contains all personal data we hold about you as of the export date.
            For questions or concerns, please contact our privacy team.
            ================================
            """,
            "PIPEDA": """
            
            ================================
            PIPEDA DATA EXPORT DISCLAIMER
            ================================
            This data export has been generated in accordance with the Personal 
            Information Protection and Electronic Documents Act (PIPEDA). You have the 
            right to:
            - Access your personal information
            - Challenge the accuracy of your personal information
            - Request correction of your personal information
            - Withdraw consent where applicable
            
            This export contains all personal information we hold about you as of the export date.
            For questions or concerns, please contact our privacy officer.
            ================================
            """
        }
        
        disclaimer = disclaimers.get(jurisdiction, "")
        return data + disclaimer
