using System;

namespace System.Diagnostics.Contracts
{
	public class ContractClassAttribute : Attribute
	{
		public ContractClassAttribute(Type a_oType)
		{
		}
	};
	public class ContractClassForAttribute : Attribute
	{
		public ContractClassForAttribute(Type a_oType)
		{
		}
	};
	public class ContractInvariantMethod : Attribute
	{
		public ContractInvariantMethod()
		{
		}
	};

	public static class Contract
	{
		public static void Invariant(bool a_bCondition)
		{
		}

		public static void Ensures(bool a_bCondition)
		{
		}
        
        public static void Assume(bool a_bCondition)
		{
		}

		public static T Result<T>()
		{
			return default(T);
		}

		public static void Requires<E>(bool a_bCondition, string a_strMsg = "")
			where E : Exception
		{
		}
	};
};