import math
import datetime
from decimal import Decimal, ROUND_HALF_UP

def js_round(val):
    if val is None:
        return None
    # Matches JS Math.round
    return int(math.floor(val + 0.5))

def js_to_fixed(val, digits):
    # Matches JS .toFixed(digits) closely
    # Converts float to decimal, then rounds HALF_UP.
    # Note: JS float precision issues might still differ in extreme edges,
    # but this handles the typical 0.5 -> round up behavior unlike Python round().
    if val is None:
        return None
    
    # We first represent the float exactly (or format to sufficient precision to avoid issues like 1.05 -> 1.0499999999999998)
    # The safest way is to format it to a long string and convert to Decimal.
    d = Decimal(str(val))
    
    quantize_format = '0.' + ('0' * digits) if digits > 0 else '0'
    res = d.quantize(Decimal(quantize_format), rounding=ROUND_HALF_UP)
    
    res_str = str(res)
    if res_str.startswith("-0") and all(c in ('0', '.') for c in res_str[1:]):
        res_str = res_str[1:]
    return res_str

def add_days(date_str, days):
    # Matches _addDays in JS which uses UTC arithmetic.
    # date_str: "YYYY-MM-DD"
    # days: int
    dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    dt = dt + datetime.timedelta(days=days)
    return dt.strftime("%Y-%m-%d")

def is_valid_date(date_str):
    if not isinstance(date_str, str) or len(date_str) != 10:
        return False
    # Check format YYYY-MM-DD
    import re
    if not re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return False
    
    try:
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False
